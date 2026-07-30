require('dotenv').config();
const mongoose = require('mongoose');
const Bread = require('./models/Bread');

const breadData = [
  {
    name: 'Alaafia Special Bread',
    description: 'Freshly baked, soft, and delicious — the Alaafia signature loaf.',
    sizes: [
      { size: 'small', price: 500 },
      { size: 'medium', price: 1000 },
      { size: 'large', price: 1500 },
      { size: 'very large', price: 2000 }
    ],
    image: '/images/alaafia-bread.jpg',
    stock: 50
  }
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    await Bread.deleteMany({});
    await Bread.insertMany(breadData);

    console.log('Bread data seeded successfully!');
    process.exit();
  } catch (err) {
    console.error('Seeding error:', err);
    process.exit(1);
  }
}

seed();