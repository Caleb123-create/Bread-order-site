const express = require('express');
const router = express.Router();
const Bread = require('../models/Bread');
const Order = require('../models/Order');

// Middleware: require login
function ensureAuth(req, res, next) {
  if (req.isAuthenticated()) return next();
  res.redirect('/login');
}

// GET home page - list all breads + carousel
router.get('/', async (req, res) => {
  const breads = await Bread.find();
  res.render('home', { breads, user: req.user });
});

// POST add to cart (stores cart in session)
router.post('/cart/add', async (req, res) => {
  const { breadId, size, quantity } = req.body;
  const bread = await Bread.findById(breadId);
  if (!bread) return res.redirect('/');

  const sizeOption = bread.sizes.find((s) => s.size === size);
  if (!sizeOption) return res.redirect('/');

  if (!req.session.cart) req.session.cart = [];

  // Treat different sizes of the same bread as separate cart lines
  const existingItem = req.session.cart.find(
    (item) => item.breadId === breadId && item.size === size
  );

  if (existingItem) {
    existingItem.quantity += parseInt(quantity) || 1;
  } else {
    req.session.cart.push({
      breadId: bread._id.toString(),
      name: bread.name,
      size: sizeOption.size,
      price: sizeOption.price,
      quantity: parseInt(quantity) || 1
    });
  }

  res.redirect('/cart');
});

// GET cart page
router.get('/cart', (req, res) => {
  const cart = req.session.cart || [];
  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  res.render('cart', { cart, total, user: req.user });
});

// POST remove item from cart
router.post('/cart/remove', (req, res) => {
  const { breadId, size } = req.body;
  if (req.session.cart) {
    req.session.cart = req.session.cart.filter(
      (item) => !(item.breadId === breadId && item.size === size)
    );
  }
  res.redirect('/cart');
});

// GET checkout page (requires login)
router.get('/checkout', ensureAuth, (req, res) => {
  const cart = req.session.cart || [];
  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  if (cart.length === 0) return res.redirect('/cart');
  res.render('checkout', { cart, total, user: req.user, error: null });
});

// POST place order (requires login)
router.post('/checkout', ensureAuth, async (req, res) => {
  try {
    const cart = req.session.cart || [];
    if (cart.length === 0) return res.redirect('/cart');

    const { address, phone } = req.body;
    const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

    await Order.create({
      user: req.user._id,
      items: cart.map((item) => ({
        bread: item.breadId,
        name: item.name,
        size: item.size,
        price: item.price,
        quantity: item.quantity
      })),
      totalAmount: total,
      address,
      phone
    });

    req.session.cart = [];
    res.render('order-confirmation', { user: req.user });
  } catch (err) {
    console.error(err);
    res.redirect('/checkout');
  }
});

// GET order history (requires login)
router.get('/orders', ensureAuth, async (req, res) => {
  const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
  res.render('orders', { orders, user: req.user });
});

module.exports = router;
