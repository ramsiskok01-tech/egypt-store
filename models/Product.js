const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  suggestedPrice: Number,
  category: { type: String, enum: ['ملابس', 'أدوات منزلية', 'أحذية', 'بنطلونات'], required: true },
  seller: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  quantity: { type: Number, required: true },
  colors: [String],
  sizes: [String],
  images: [String],
  rating: { type: Number, default: 0 },
  reviews: [{
    user: mongoose.Schema.Types.ObjectId,
    rating: Number,
    comment: String,
    date: { type: Date, default: Date.now }
  }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  isActive: { type: Boolean, default: true }
});

module.exports = mongoose.model('Product', productSchema);