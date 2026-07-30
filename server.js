require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const passport = require('passport');

const app = express();
const PORT = process.env.PORT || 3000;

// ---- Database ----
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.error('MongoDB connection error:', err));

// ---- View engine ----
app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');

// ---- Middleware ----
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(__dirname + '/public'));

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: process.env.MONGO_URI }),
    cookie: { maxAge: 1000 * 60 * 60 * 24 } // 1 day
  })
);

// ---- Passport ----
require('./config/passport')(passport);
app.use(passport.initialize());
app.use(passport.session());

// Make logged-in user available in all views
app.use((req, res, next) => {
  res.locals.user = req.user || null;
  next();
});

// ---- Routes ----
app.use('/', require('./routes/auth'));
app.use('/', require('./routes/breads'));
app.use('/admin', require('./routes/admin'));

// ---- 404 handler ----
app.use((req, res) => {
  res.status(404).send('Page not found');
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
