const express = require('express');
const Product = require('../models/Product');
const Order = require('../models/Order');
const Seller = require('../models/Seller');
const User = require('../models/User');
const router = express.Router();
const auth = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');

// Get dashboard stats
router.get('/stats', auth, adminAuth, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalSellers = await User.countDocuments({ userType: 'seller' });
    const totalProducts = await Product.countDocuments();
    const totalOrders = await Order.countDocuments();
    const totalRevenue = await Order.aggregate([{ $group: { _id: null, total: { $sum: '$commission' } } }]);

    res.json({
      totalUsers,
      totalSellers,
      totalProducts,
      totalOrders,
      totalRevenue: totalRevenue[0]?.total || 0
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Approve seller
router.put('/sellers/:sellerId/approve', auth, adminAuth, async (req, res) => {
  try {
    const seller = await Seller.findById(req.params.sellerId);
    if (!seller) return res.status(404).json({ message: 'البائع غير موجود' });

    seller.status = 'approved';
    seller.approvedAt = Date.now();
    await seller.save();

    res.json({ message: 'تم قبول البائع', seller });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Edit product
router.put('/products/:productId', auth, adminAuth, async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.productId, req.body, { new: true });
    if (!product) return res.status(404).json({ message: 'المنتج غير موجود' });

    res.json({ message: 'تم تحديث المنتج', product });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all pending sellers
router.get('/sellers/pending', auth, adminAuth, async (req, res) => {
  try {
    const sellers = await Seller.find({ status: 'pending' }).populate('user', 'name email phone');
    res.json(sellers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;