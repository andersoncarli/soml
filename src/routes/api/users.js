// routes/api/users.js
const express = require('express');
const router = express.Router();
const { db } = require('../../db');
const jwt = require('jsonwebtoken');
const secret = 'your_secret_key';

// User registration
router.post('/register', async (req, res) => {
  const { name, email, password } = req.body;
  // Create a new user in the database
  const user = await db.collection('users').insertOne({ name, email, password });
  // Generate a JWT token
  const token = jwt.sign({ userId: user.insertedId }, secret);
  res.json({ token });
});

// User login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  // Find the user in the database
  const user = await db.collection('users').findOne({ email, password });
  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  // Generate a JWT token
  const token = jwt.sign({ userId: user._id }, secret);
  res.json({ token });
});

module.exports = router;