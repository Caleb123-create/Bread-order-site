const express = require('express');
const router = express.Router();
const Admin = require('../models/Admin');
const Order = require('../models/Order');

// Middleware: require admin session
function ensureAdmin(req, res, next) {
  if (req.session.adminId) return next();
  res.redirect('/admin/login');
}

// GET admin login page
router.get('/login', (req, res) => {
  res.render('admin/login', { error: null });
});

// POST admin login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const admin = await Admin.findOne({ email: email.toLowerCase() });

    if (!admin) return res.render('admin/login', { error: 'Invalid email or password' });

    const isMatch = await admin.comparePassword(password);
    if (!isMatch) return res.render('admin/login', { error: 'Invalid email or password' });

    req.session.adminId = admin._id;
    res.redirect('/admin/orders');
  } catch (err) {
    console.error(err);
    res.render('admin/login', { error: 'Something went wrong. Try again.' });
  }
});

// GET admin logout
router.get('/logout', (req, res) => {
  req.session.adminId = null;
  res.redirect('/admin/login');
});

// GET all orders (protected)
router.get('/orders', ensureAdmin, async (req, res) => {
  const orders = await Order.find().populate('user', 'name email').sort({ createdAt: -1 });
  res.render('admin/orders', { orders });
});

// POST update order status (protected)
router.post('/orders/:id/status', ensureAdmin, async (req, res) => {
  const { status } = req.body;
  await Order.findByIdAndUpdate(req.params.id, { status });
  res.redirect('/admin/orders');
});

module.exports = router;
