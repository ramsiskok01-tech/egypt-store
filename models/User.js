const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: String,
  address: String,
  city: String,
  postalCode: String,
  userType: { type: String, enum: ['buyer', 'seller', 'admin'], default: 'buyer' },
  profileImage: String,
  wallet: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  isVerified: { type: Boolean, default: false }
});

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.comparePassword = async function(password) {
  return await bcrypt.compare(password, this.password);
};

module.exports = mongoose.model('User', userSchema);