const express = require('express');
const Product = require('../models/Product');
const router = express.Router();

const auth = require('../middleware/auth');

// Get all products
router.get('/', async (req, res) => {
  try {
    const products = await Product.find({ isActive: true }).populate('seller', 'name');
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get product by category
router.get('/category/:category', async (req, res) => {
  try {
    const products = await Product.find({ category: req.params.category, isActive: true }).populate('seller', 'name');
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create product (seller)
router.post('/', auth, async (req, res) => {
  try {
    const { name, description, price, category, quantity, colors, sizes, images } = req.body;
    
    if (!name || !description || !price || !category) {
      return res.status(400).json({ message: 'الحقول مطلوبة' });
    }

    // Check if price is reasonable
    if (price < 10) {
      return res.status(400).json({ message: 'السعر منخفض جداً. السعر الأدنى: 10 جنيه', suggestedPrice: 50 });
    }

    const product = new Product({
      name,
      description,
      price,
      category,
      quantity,
      colors: colors || [],
      sizes: sizes || [],
      images: images || [],
      seller: req.user.id
    });

    await product.save();
    res.status(201).json({ message: 'تم إضافة المنتج بنجاح', product });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update product
router.put('/:id', auth, async (req, res) => {
  try {
    let product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'المنتج غير موجود' });

    if (product.seller.toString() !== req.user.id && req.user.userType !== 'admin') {
      return res.status(403).json({ message: 'غير مصرح' });
    }

    Object.assign(product, req.body);
    product.updatedAt = Date.now();
    await product.save();

    res.json({ message: 'تم تحديث المنتج', product });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;