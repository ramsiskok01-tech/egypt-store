const jwt = require('jsonwebtoken');

const auth = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ message: 'لا يوجد توكن' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    req.user = { id: decoded.id };
    next();
  } catch (error) {
    res.status(401).json({ message: 'توكن غير صحيح' });
  }
};

module.exports = auth;