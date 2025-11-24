// Blog2 Server - Schema-driven with CentralStation
const CentralStation = require('../src/centralstation');
const { soml } = require('../src/soml');
const express = require('express');
const path = require('path');

// Import schemas (source of truth for views!)
const Post = require('./schemas/Post-concise');
const Comment = require('./schemas/Comment-concise');

// Import page components (they USE schema views)
const HomePage = require('./pages/HomePage-schema.soml');
const PostDetail = require('./pages/PostDetail-schema.soml');

// Import data store
const store = require('./store');

// Create CentralStation server
const cs = CentralStation({ type: 'express', port: 3000 });

// Middleware
cs.use(express.json());
cs.use(express.urlencoded({ extended: true }));
cs.use(express.static(path.join(__dirname, 'public')));

// Serve CentralStation client
cs.route('/centralstation.js', 'GET', (req, res) => {
  res.sendFile(path.join(__dirname, '../src/centralstation/client.js'));
});

// Serve SOML client helpers (get, set, on, soml, create)
cs.route('/soml-client.js', 'GET', (req, res) => {
  res.sendFile(path.join(__dirname, '../src/soml-client.js'));
});

// Serve CSS
cs.route('/styles/app.css', 'GET', (req, res) => {
  res.sendFile(path.join(__dirname, 'styles/app.css'));
});

// Serve schemas for client-side use
cs.route('/schemas.js', 'GET', (req, res) => {
  // Inject schemas into client-side
  const schemasJS = `
    // Post and Comment schemas for client-side use
    window.PostSchema = ${JSON.stringify({
      views: {
        card: Post.views.card.toString()
      }
    })};
    
    window.CommentSchema = ${JSON.stringify({
      views: {
        item: Comment.views.item.toString()
      }
    })};
    
    // Reconstruct functions (simplified for demo)
    console.log('✓ Schemas loaded on client-side');
  `;
  res.type('application/javascript').send(schemasJS);
});

// Routes - Using schema-driven pages
cs.route('/blog2', 'GET', (req, res) => {
  const posts = store.getPosts();
  
  // HomePage USES Post.views.list()
  const html = soml.toHtml(HomePage({
    posts,
    onlineCount: store.getOnlineCount()
  }));
  
  res.send(html);
});

// Post detail page - Using schema views
cs.route('/blog2/posts/:id', 'GET', (req, res) => {
  const post = store.getPost(req.params.id);
  if (!post) return res.status(404).send('Post not found');
  
  const comments = store.getComments(req.params.id);
  
  // Increment view count
  store.incrementViewCount(req.params.id);
  
  // PostDetail USES Post.views.detail() and Comment.views.*
  const html = soml.toHtml(PostDetail({
    post,
    comments,
    onlineCount: store.getOnlineCount()
  }));
  
  res.send(html);
});

// WebSocket Events (CentralStation pattern)
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
  
  // Broadcast using schema event
  cs.broadcast('comment:created', comment);
  
  // Trigger schema event handler
  if (Comment.events['comment:created']) {
    Comment.events['comment:created'](comment);
  }
  
  console.log(`✓ Comment created by ${data.author} on post ${data.postId}`);
});

cs.on('comment:like', (data, client) => {
  const comment = store.likeComment(data.postId, data.commentId);
  
  if (comment) {
    cs.broadcast('comment:liked', {
      id: comment.id,
      likes: comment.likes
    });
    
    // Trigger schema event handler
    if (Comment.events['comment:liked']) {
      Comment.events['comment:liked'](comment);
    }
  }
});

// Start server
cs.start().then(() => {
  console.log('\n🚂 Blog2 Server Running! (Schema-Driven)');
  console.log('   • URL: http://localhost:3000/blog2');
  console.log('   • WebSocket: ws://localhost:3000/ws');
  console.log('   • Architecture: Schema-driven with CentralStation');
  console.log('   • Views: Post.views.* and Comment.views.*');
  console.log('   • Syntax: Concise SOML throughout');
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

