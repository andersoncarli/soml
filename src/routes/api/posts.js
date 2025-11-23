// routes/api/posts.js
const express = require('express');
const router = express.Router();
const { db } = require('../../db');
const { ObjectId } = require('mongodb');

// Get all posts for the authenticated user
router.get('/', async (req, res) => {
  const userId = req.user.userId;
  const posts = await db.collection('posts').find({ userId }).toArray();
  res.json(posts);
});

// Create a new post
router.post('/', async (req, res) => {
  const userId = req.user.userId;
  const { title, content } = req.body;
  const post = await db.collection('posts').insertOne({ userId, title, content });
  res.json(post.ops[0]);
});

// Update a post
router.put('/:id', async (req, res) => {
  const userId = req.user.userId;
  const { id } = req.params;
  const { title, content } = req.body;
  const result = await db.collection('posts').updateOne(
    { _id: ObjectId(id), userId },
    { $set: { title, content } }
  );
  res.json(result);
});

// Delete a post
router.delete('/:id', async (req, res) => {
  const userId = req.user.userId;
  const { id } = req.params;
  const result = await db.collection('posts').deleteOne({ _id: ObjectId(id), userId });
  res.json(result);
});

module.exports = router;