// routes/api/tasks.js
const express = require('express');
const router = express.Router();
const { db } = require('../../db');
const { ObjectId } = require('mongodb');

// Get all tasks for the authenticated user
router.get('/', async (req, res) => {
  const userId = req.user.userId;
  const tasks = await db.collection('tasks').find({ userId }).toArray();
  res.json(tasks);
});

// Create a new task
router.post('/', async (req, res) => {
  const userId = req.user.userId;
  const { description, dueDate, completed } = req.body;
  const task = await db.collection('tasks').insertOne({ userId, description, dueDate, completed });
  res.json(task.ops[0]);
});

// Update a task
router.put('/:id', async (req, res) => {
  const userId = req.user.userId;
  const { id } = req.params;
  const { description, dueDate, completed } = req.body;
  const result = await db.collection('tasks').updateOne(
    { _id: ObjectId(id), userId },
    { $set: { description, dueDate, completed } }
  );
  res.json(result);
});

// Delete a task
router.delete('/:id', async (req, res) => {
  const userId = req.user.userId;
  const { id } = req.params;
  const result = await db.collection('tasks').deleteOne({ _id: ObjectId(id), userId });
  res.json(result);
});

module.exports = router;