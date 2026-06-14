const mongoose = require('mongoose');

const sellerSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  companyName: { type: String, required: true },
  nationalId: { type: String, required: true, unique: true },
  sellerId: { type: String, required: true, unique: true },
  bankAccount: String,
  bankName: String,
  shippingCompany: { type: String, required: true },
  shippingCompanyPhone: { type: String, required: true },
  shippingCompanyId: String,
  totalSales: { type: Number, default: 0 },
  totalEarnings: { type: Number, default: 0 },
  rating: { type: Number, default: 0 },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  createdAt: { type: Date, default: Date.now },
  approvedAt: Date
});

module.exports = mongoose.model('Seller', sellerSchema);