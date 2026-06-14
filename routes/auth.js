const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const router = express.Router();

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'secret', { expiresIn: '30d' });
};

// Register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, userType } = req.body;
    
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'الرجاء ملء جميع الحقول' });
    }

    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: 'المستخدم موجود بالفعل' });
    }

    user = new User({ name, email, password, userType });
    await user.save();

    const token = generateToken(user._id);
    res.status(201).json({
      message: 'تم التسجيل بنجاح',
      token,
      user: { id: user._id, name: user.name, email: user.email, userType: user.userType }
    });
  } catch (error) {
    res.status(500).json({ message: 'خطأ في التسجيل', error: error.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ message: 'الرجاء إدخال البريد والكلمة السرية' });
    }

    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'بريد أو كلمة سرية خاطئة' });
    }

    const token = generateToken(user._id);
    res.json({
      message: 'تم تسجيل الدخول بنجاح',
      token,
      user: { id: user._id, name: user.name, email: user.email, userType: user.userType }
    });
  } catch (error) {
    res.status(500).json({ message: 'خطأ في تسجيل الدخول', error: error.message });
  }
});

module.exports = router;