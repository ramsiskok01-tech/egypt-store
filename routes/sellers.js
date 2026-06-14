const express = require('express');
const Seller = require('../models/Seller');
const User = require('../models/User');
const router = express.Router();
const auth = require('../middleware/auth');

// Register as seller
router.post('/register', auth, async (req, res) => {
  try {
    const { companyName, nationalId, sellerId, bankAccount, bankName, shippingCompany, shippingCompanyPhone, shippingCompanyId } = req.body;
    
    if (!companyName || !nationalId || !sellerId || !shippingCompany || !shippingCompanyPhone) {
      return res.status(400).json({ message: 'جميع الحقول مطلوبة' });
    }

    let seller = await Seller.findOne({ user: req.user.id });
    if (seller) return res.status(400).json({ message: 'أنت مسجل بالفعل كبائع' });

    seller = new Seller({
      user: req.user.id,
      companyName,
      nationalId,
      sellerId,
      bankAccount,
      bankName,
      shippingCompany,
      shippingCompanyPhone,
      shippingCompanyId
    });

    await seller.save();
    
    // Update user type
    await User.findByIdAndUpdate(req.user.id, { userType: 'seller' });

    res.status(201).json({ message: 'تم تسجيل البائع بنجاح', seller });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get seller profile
router.get('/:userId', async (req, res) => {
  try {
    const seller = await Seller.findOne({ user: req.params.userId }).populate('user', 'name email phone');
    if (!seller) return res.status(404).json({ message: 'البائع غير موجود' });
    res.json(seller);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;