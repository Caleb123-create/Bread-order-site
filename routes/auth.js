const express = require('express');
const router = express.Router();
const passport = require('passport');
const User = require('../models/User');

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
  res.render('login', { error: null });
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

module.exports = router;
