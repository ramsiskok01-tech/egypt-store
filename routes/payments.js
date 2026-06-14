const express = require('express');
const Payment = require('../models/Payment');
const Order = require('../models/Order');
const User = require('../models/User');
const router = express.Router();
const auth = require('../middleware/auth');

// Process payment
router.post('/process', auth, async (req, res) => {
  try {
    const { orderId, paymentMethod } = req.body;
    
    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ message: 'الطلب غير موجود' });

    const user = await User.findById(req.user.id);

    if (paymentMethod === 'wallet') {
      if (user.wallet < order.totalPrice) {
        return res.status(400).json({ message: 'رصيد المحفظة غير كافي' });
      }
      user.wallet -= order.totalPrice;
      await user.save();
    }

    const payment = new Payment({
      order: orderId,
      user: req.user.id,
      amount: order.totalPrice,
      method: paymentMethod,
      status: paymentMethod === 'cash' ? 'pending' : 'completed'
    });

    await payment.save();

    order.paymentStatus = paymentMethod === 'cash' ? 'pending' : 'completed';
    order.status = paymentMethod === 'cash' ? 'pending' : 'confirmed';
    await order.save();

    // Add commission to admin
    const admin = await User.findOne({ email: 'ramsiskok01@gmail.com' });
    if (admin) {
      admin.wallet += order.commission;
      await admin.save();
    }

    res.json({ message: 'تمت المعاملة بنجاح', payment });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Add wallet funds
router.post('/wallet/add', auth, async (req, res) => {
  try {
    const { amount } = req.body;
    
    if (amount < 10) return res.status(400).json({ message: 'الحد الأدنى 10 جنيه' });

    const user = await User.findById(req.user.id);
    user.wallet += amount;
    await user.save();

    res.json({ message: 'تم إضافة الرصيد', wallet: user.wallet });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;