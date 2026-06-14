const express = require('express');
const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');
const router = express.Router();
const auth = require('../middleware/auth');

const generateOrderNumber = () => {
  return 'ORD-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9).toUpperCase();
};

// Create order
router.post('/', auth, async (req, res) => {
  try {
    const { products, paymentMethod, shippingAddress, shippingPhone } = req.body;
    
    if (!products || !paymentMethod || !shippingAddress) {
      return res.status(400).json({ message: 'البيانات ناقصة' });
    }

    let totalPrice = 0;
    const orderProducts = [];

    for (let item of products) {
      const product = await Product.findById(item.productId);
      if (!product) return res.status(404).json({ message: 'المنتج غير موجود' });
      if (product.quantity < item.quantity) return res.status(400).json({ message: 'الكمية غير متوفرة' });

      totalPrice += product.price * item.quantity;
      orderProducts.push({
        product: product._id,
        quantity: item.quantity,
        color: item.color,
        size: item.size,
        price: product.price
      });

      product.quantity -= item.quantity;
      await product.save();
    }

    const commission = totalPrice * 0.10;
    const order = new Order({
      orderNumber: generateOrderNumber(),
      buyer: req.user.id,
      seller: orderProducts[0]?.product?.seller || products[0].sellerId,
      products: orderProducts,
      totalPrice,
      commission,
      sellerPrice: totalPrice - commission,
      paymentMethod,
      shippingAddress,
      shippingPhone
    });

    await order.save();
    res.status(201).json({ message: 'تم إنشاء الطلب', order });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get user orders
router.get('/user/:userId', auth, async (req, res) => {
  try {
    const orders = await Order.find({ $or: [{ buyer: req.params.userId }, { seller: req.params.userId }] })
      .populate('buyer', 'name email')
      .populate('seller', 'name')
      .populate('products.product', 'name price');
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update order status
router.put('/:id/status', auth, async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findById(req.params.id);
    
    if (!order) return res.status(404).json({ message: 'الطلب غير موجود' });
    if (order.seller.toString() !== req.user.id && req.user.userType !== 'admin') {
      return res.status(403).json({ message: 'غير مصرح' });
    }

    order.status = status;
    order.updatedAt = Date.now();
    await order.save();

    res.json({ message: 'تم تحديث حالة الطلب', order });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;