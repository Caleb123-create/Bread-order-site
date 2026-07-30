const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  bread: { type: mongoose.Schema.Types.ObjectId, ref: 'Bread', required: true },
  name: { type: String, required: true },
  size: { type: String, enum: ['small', 'medium', 'large', 'very large'], required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true, min: 1 }
}, { _id: false });

const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: [orderItemSchema],
  totalAmount: { type: Number, required: true },
  address: { type: String, required: true },
  phone: { type: String, required: true },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'delivered', 'cancelled'],
    default: 'pending'
  }
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
