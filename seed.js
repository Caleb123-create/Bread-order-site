// Run this once with: node seed.js
// Edit the breadData array below with your real bread names, descriptions, and prices per size.

require('dotenv').config();
const mongoose = require('mongoose');
const Bread = require('./models/Bread');

const breadData = [
  {
    name: 'Ala-fia Bread',
    description: 'Classic tangy sourdough, baked fresh daily.',
    sizes: [
      { size: 'small', price: 500 },
      { size: 'medium', price: 1200 },
      { size: 'big', price: 1500 }
    ],
    image: '/images/sourdough.jpg',
    stock: 20
  },
  {
    name: 'Whole Wheat Bread',
    description: 'Healthy whole wheat loaf, soft and filling.',
    sizes: [
      { size: 'small', price: 1200 },
      { size: 'medium', price: 2000 },
      { size: 'big', price: 3000 }
    ],
    image: '/images/whole-wheat.jpg',
    stock: 20
  },
  {
    name: 'French Baguette',
    description: 'Crispy outside, soft inside — a classic favorite.',
    sizes: [
      { size: 'small', price: 1000 },
      { size: 'medium', price: 1800 },
      { size: 'big', price: 2800 }
    ],
    image: '/images/baguette.jpg',
    stock: 20
  }
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    await Bread.deleteMany({}); // clears existing breads before reseeding
    await Bread.insertMany(breadData);

    console.log('Bread data seeded successfully!');
    process.exit();
  } catch (err) {
    console.error('Seeding error:', err);
    process.exit(1);
  }
}

seed();
