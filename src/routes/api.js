// routes/api.js
const express = require('express');
const router = express.Router();
const { db } = require('../db.js');
const { verifyToken } = require('../middleware/auth');

// API routes for users, posts, and tasks
router.use('/users', verifyToken, require('./api/users'));
router.use('/posts', verifyToken, require('./api/posts'));
router.use('/tasks', verifyToken, require('./api/tasks'));

module.exports = router;