const mongoose = require('mongoose');

const sizeSchema = new mongoose.Schema({
  size: { type: String, enum: ['small', 'medium', 'large', 'very large'], required: true },
  price: { type: Number, required: true }
}, { _id: false });

const breadSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, default: '' },
  sizes: { type: [sizeSchema], required: true }, // e.g. [{ size: 'small', price: 1500 }, ...]
  image: { type: String, default: '/images/default-bread.jpg' },
  stock: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('Bread', breadSchema);
