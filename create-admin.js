require('dotenv').config();
const mongoose = require('mongoose');
const Admin = require('./models/Admin');

const ADMIN_EMAIL = 'calebolaomo@gmail.com';
const ADMIN_PASSWORD = 'Caleb&100305';

async function createAdmin() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    const existing = await Admin.findOne({ email: ADMIN_EMAIL });
    if (existing) {
      console.log('An admin with that email already exists.');
      process.exit();
    }

    await Admin.create({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD });
    console.log('Admin account created successfully!');
    console.log('Email:', ADMIN_EMAIL);
    console.log('Password:', ADMIN_PASSWORD);
    process.exit();
  } catch (err) {
    console.error('Error creating admin:', err);
    process.exit(1);
  }
}

createAdmin();