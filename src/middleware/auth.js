const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

module.exports = {
  generateToken: (user) => {
    return jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '1d' });
  },
  verifyToken: (token) => {
    try {
      return jwt.verify(token, JWT_SECRET);
    } catch (error) {
      return null;
    }
  },
  hashPassword: async (password) => {
    return bcrypt.hash(password, 10);
  },
  comparePassword: async (password, hash) => {
    return bcrypt.compare(password, hash);
  }
};