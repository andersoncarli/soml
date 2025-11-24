// Server using CentralStation-inspired schema system
const express = require('express');
const { db } = require('./src/db');
const { events } = require('./src/events');

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Load schemas
const Post = require('./src/schemas/Post');

console.log('Loading schemas...');
console.log('✓ Post schema loaded');

// Register web routes from schemas
Post.getRoutes(db).forEach(({ path, handler }) => {
  console.log(`  Registering GET ${path}`);
  app.get(path, handler);
});

// Register API routes from schemas
Post.getAPIRoutes(db).forEach(({ method, path, handler }) => {
  console.log(`  Registering ${method.toUpperCase()} ${path}`);
  app[method](path, handler);
});

// Register event handlers from schemas
Object.entries(Post.events).forEach(([event, handler]) => {
  console.log(`  Registering event: ${event}`);
  events.on(event, handler);
});

// Enhanced API routes with event emission
app.post('/api/posts', async (req, res) => {
  try {
    const dbConn = await db.connect();
    const crud = Post.getCRUD(dbConn);
    const post = await crud.create(req.body);
    
    // Emit event
    events.emit('post:created', post);
    
    res.status(201).json(post);
  } catch (error) {
    console.error('Error creating post:', error);
    res.status(400).json({ error: error.message });
  }
});

app.put('/api/posts/:id', async (req, res) => {
  try {
    const dbConn = await db.connect();
    const crud = Post.getCRUD(dbConn);
    await crud.update(req.params.id, req.body);
    const post = await crud.read(req.params.id);
    
    // Emit event
    events.emit('post:updated', post);
    
    res.json(post);
  } catch (error) {
    console.error('Error updating post:', error);
    res.status(400).json({ error: error.message });
  }
});

app.delete('/api/posts/:id', async (req, res) => {
  try {
    const dbConn = await db.connect();
    const crud = Post.getCRUD(dbConn);
    await crud.delete(req.params.id);
    
    // Emit event
    events.emit('post:deleted', { id: req.params.id });
    
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting post:', error);
    res.status(500).json({ error: error.message });
  }
});

// Home route
app.get('/', (req, res) => {
  res.redirect('/posts');
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ error: err.message });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`\n✅ Server with CentralStation patterns running!`);
  console.log(`   http://localhost:${PORT}`);
  console.log(`\n   Routes available:`);
  console.log(`   GET  /posts          - List all posts`);
  console.log(`   GET  /posts/:id      - View post detail`);
  console.log(`   GET  /api/posts      - API: List posts`);
  console.log(`   POST /api/posts      - API: Create post`);
  console.log(`   PUT  /api/posts/:id  - API: Update post`);
  console.log(`   DELETE /api/posts/:id - API: Delete post`);
  console.log(`\n   Events registered:`);
  console.log(`   - post:created`);
  console.log(`   - post:updated`);
  console.log(`   - post:deleted`);
});

