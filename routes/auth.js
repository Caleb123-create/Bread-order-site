const express = require('express');
const router = express.Router();
const passport = require('passport');
const User = require('../models/User');
const crypto = require('crypto');
const sendEmail = require('../utils/sendEmail');

// GET register page
router.get('/register', (req, res) => {
  res.render('register', { error: null });
});

// POST register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.render('register', { error: 'An account with that email already exists.' });
    }

    await User.create({ name, email, password });
    res.redirect('/login');
  } catch (err) {
    console.error(err);
    res.render('register', { error: 'Something went wrong. Please try again.' });
  }
});

// GET login page
router.get('/login', (req, res) => {
  const success = req.query.reset ? 'Password updated. You can now log in.' : null;
  res.render('login', { error: null, success });
});

// POST login
router.post('/login', (req, res, next) => {
  passport.authenticate('local', (err, user, info) => {
    if (err) return next(err);
    if (!user) return res.render('login', { error: info.message || 'Login failed' });

    req.logIn(user, (err) => {
      if (err) return next(err);
      return res.redirect('/');
    });
  })(req, res, next);
});

// GET logout
router.get('/logout', (req, res, next) => {
  req.logout((err) => {
    if (err) return next(err);
    res.redirect('/');
  });
});

// Forgot password page
router.get('/forgot-password', (req, res) => {
  res.render('forget-password', { message: null, error: null });
});

// Send reset link
router.post('/forgot-password', async (req, res) => {
  const genericMessage = 'If an account exists for that email, a reset link has been sent.';
  try {
    const user = await User.findOne({ email: req.body.email.toLowerCase() });

    if (user) {
      const token = crypto.randomBytes(32).toString('hex');
      user.resetPasswordToken = crypto.createHash('sha256').update(token).digest('hex');
      user.resetPasswordExpires = Date.now() + 60 * 60 * 1000; // 1 hour
      await user.save();

      const link = `${process.env.BASE_URL}/reset-password/${token}`;
      await sendEmail({
        to: user.email,
        subject: 'Reset your Alaafia Special Bread password',
        html: `<p>Hi ${user.name},</p>
               <p>Click the link below to set a new password. It expires in 1 hour.</p>
               <p><a href="${link}">${link}</a></p>
               <p>If you didn't ask for this, you can ignore this email.</p>`
      });
    }

    res.render('forgot-password', { message: genericMessage, error: null });
  } catch (err) {
    console.error(err);
    res.render('forgot-password', { message: null, error: 'Could not send the email. Please try again later.' });
  }
});

// Reset page (from the email link)
router.get('/reset-password/:token', async (req, res) => {
  const hashed = crypto.createHash('sha256').update(req.params.token).digest('hex');
  const user = await User.findOne({
    resetPasswordToken: hashed,
    resetPasswordExpires: { $gt: Date.now() }
  });

  if (!user) {
    return res.render('forgot-password', { message: null, error: 'That reset link is invalid or has expired. Please request a new one.' });
  }
  res.render('reset-password', { token: req.params.token, error: null });
});

// Save the new password
router.post('/reset-password/:token', async (req, res) => {
  const hashed = crypto.createHash('sha256').update(req.params.token).digest('hex');
  const user = await User.findOne({
    resetPasswordToken: hashed,
    resetPasswordExpires: { $gt: Date.now() }
  });

  if (!user) {
    return res.render('forgot-password', { message: null, error: 'That reset link is invalid or has expired. Please request a new one.' });
  }

  if (req.body.password.length < 6 || req.body.password !== req.body.confirmPassword) {
    return res.render('reset-password', { token: req.params.token, error: 'Passwords must match and be at least 6 characters.' });
  }

  user.password = req.body.password; // hashed automatically when saved
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;
  await user.save();

  res.redirect('/login?reset=1');
});

module.exports = router;
