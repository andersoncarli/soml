// Blog2 Server - Minimal, component-driven
const CentralStation = require('../src/centralstation');
const { soml } = require('../src/soml');
const express = require('express');
const path = require('path');

// Import page components
const HomePage = require('./pages/HomePage-ultra.soml');
const PostDetail = require('./pages/PostDetail.soml');

// Import data store
const store = require('./store');

// Create CentralStation server
const cs = CentralStation({ type: 'express', port: 3000 });

// Middleware
cs.use(express.json());
cs.use(express.urlencoded({ extended: true }));
cs.use(express.static(path.join(__dirname, 'public')));
cs.use('/styles', express.static(path.join(__dirname, 'styles')));

// Serve CentralStation client
cs.route('/centralstation.js', 'GET', (req, res) => {
  res.sendFile(path.join(__dirname, '../src/centralstation/client.js'));
});

// Serve SOML client helpers (get, set, on, soml, create)
cs.route('/soml-client.js', 'GET', (req, res) => {
  res.sendFile(path.join(__dirname, '../src/soml-client.js'));
});

// Routes
cs.route('/blog2', 'GET', (req, res) => {
  const posts = store.getPosts();
  const html = soml.toHtml(HomePage({
    posts,
    onlineCount: store.getOnlineCount()
  }));
  res.send(html);
});

// Post detail page
cs.route('/blog2/posts/:id', 'GET', (req, res) => {
  const post = store.getPost(req.params.id);
  if (!post) return res.status(404).send('Post not found');
  
  const comments = store.getComments(req.params.id);
  
  // Increment view count
  store.incrementViewCount(req.params.id);
  
  const html = soml.toHtml(PostDetail({
    post,
    comments,
    onlineCount: store.getOnlineCount()
  }));
  
  res.send(html);
});

// WebSocket Events
cs.on('connection', (client) => {
  console.log(`✓ User connected: ${client.id}`);
  store.addUser(client.id);
  cs.broadcast('users:count', { count: store.getOnlineCount() });
  
  cs.wsHub.emit(client, 'welcome', {
    message: 'Welcome to Blog2!',
    onlineUsers: store.getOnlineCount()
  });
});

cs.on('disconnect', (client) => {
  console.log(`✗ User disconnected: ${client.id}`);
  store.removeUser(client.id);
  cs.broadcast('users:count', { count: store.getOnlineCount() });
});

cs.on('comment:create', (data, client) => {
  const comment = store.addComment(data.postId, {
    author: data.author,
    content: data.content
  });
  
  cs.broadcast('comment:created', comment);
  console.log(`✓ Comment created by ${data.author} on post ${data.postId}`);
});

cs.on('comment:like', (data, client) => {
  const comment = store.likeComment(data.postId, data.commentId);
  
  if (comment) {
    cs.broadcast('comment:liked', {
      id: comment.id,
      likes: comment.likes
    });
  }
});

// Start server
cs.start().then(() => {
  console.log('\n🚂 Blog2 Server Running!');
  console.log('   • URL: http://localhost:3000/blog2');
  console.log('   • WebSocket: ws://localhost:3000/ws');
  console.log('   • Components: .soml.js files');
  console.log('   • Data: In-memory store');
  console.log('\n   ✨ Open in multiple tabs to see real-time magic!\n');
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n\nShutting down gracefully...');
  cs.stop().then(() => {
    console.log('Server stopped.');
    process.exit(0);
  });
});
