const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'mySuperSecretKey';

// Middleware to verify JWT for users or drivers
const authenticate = (req, res, next) => {
  const token = req.header('Authorization')?.split(' ')[1]; // Expecting format "Bearer <token>"

  if (!token) return res.status(401).json({ message: 'Authentication required' });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;  // Attach user/driver info to the request object
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
};

module.exports = authenticate;