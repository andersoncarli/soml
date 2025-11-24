// CentralStation + Schema System Integration
const CentralStation = require('./src/centralstation');
const { defineSchema, Schema } = require('./src/schema');
const { soml } = require('./src/soml');
const express = require('express');
const path = require('path');

// Create CentralStation server
const cs = CentralStation({ type: 'express', port: 3000 });

// Middleware
cs.use(express.json());
cs.use(express.static('public'));

// Serve client library
cs.route('/centralstation.js', 'GET', (req, res) => {
  res.sendFile(path.join(__dirname, 'src/centralstation/client.js'));
});

// Load Post schema
console.log('\n📦 Loading schemas...');
const Post = require('./src/schemas/Post');

// Register HTTP routes from Post schema
console.log('\n🔗 Registering routes...');
const schemas = { Post };

for (const schemaName in schemas) {
  const schema = schemas[schemaName];
  
  if (schema.routes) {
    for (const routePath in schema.routes) {
      const viewName = schema.routes[routePath];
      
      cs.route(routePath, 'GET', async (req, res) => {
        try {
          // Get the view
          const view = schema.views[viewName];
          if (view) {
            // Get data (simulate for now)
            const data = viewName === 'list' 
              ? [
                  { id: '1', title: 'Real-Time Post', content: 'This updates in real-time!', authorId: 'user1', createdAt: new Date() },
                  { id: '2', title: 'WebSocket Magic', content: 'See changes instantly', authorId: 'user1', createdAt: new Date() }
                ]
              : { id: req.params.id, title: 'Single Post', content: 'Content here', authorId: 'user1', createdAt: new Date() };
            
            const rendered = soml.toHtml(view(data));
            
            // Wrap in full HTML page with CentralStation client
            const html = `
<!DOCTYPE html>
<html>
<head>
  <title>SOML + CentralStation</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      max-width: 900px;
      margin: 40px auto;
      padding: 20px;
      background: #f5f5f5;
    }
    .container {
      background: white;
      padding: 30px;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    h1 { color: #2c3e50; }
    .post-item {
      padding: 20px;
      margin: 15px 0;
      background: #f8f9fa;
      border-radius: 4px;
      border-left: 4px solid #007bff;
    }
    .post-title { 
      margin: 0 0 10px 0; 
      color: #333;
    }
    .post-title a {
      color: #007bff;
      text-decoration: none;
    }
    .post-title a:hover {
      text-decoration: underline;
    }
    .post-content {
      color: #666;
      line-height: 1.6;
    }
    .status {
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 10px 15px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: bold;
      box-shadow: 0 2px 4px rgba(0,0,0,0.2);
    }
    .connected { background: #28a745; color: white; }
    .disconnected { background: #dc3545; color: white; }
    .event-log {
      position: fixed;
      bottom: 20px;
      right: 20px;
      width: 300px;
      max-height: 200px;
      overflow-y: auto;
      background: #1e1e1e;
      color: #d4d4d4;
      padding: 10px;
      border-radius: 4px;
      font-family: 'Courier New', monospace;
      font-size: 11px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.3);
    }
    .event-log div { margin: 2px 0; }
    .event-new { color: #4ec9b0; animation: highlight 0.5s; }
    @keyframes highlight { from { background: #4ec9b0; } to { background: transparent; } }
  </style>
</head>
<body>
  <div id="status" class="status disconnected">Disconnected</div>
  
  <div class="container">
    <h1>🚂 SOML + CentralStation</h1>
    <p>Real-time schema updates with WebSocket</p>
    <div id="content">
      ${rendered}
    </div>
  </div>
  
  <div class="event-log" id="event-log"></div>
  
  <script src="/centralstation.js"></script>
  <script>
    const cs = new CentralStation();
    const status = document.getElementById('status');
    const eventLog = document.getElementById('event-log');
    
    function logEvent(event, data) {
      const div = document.createElement('div');
      div.className = 'event-new';
      div.textContent = event + ': ' + JSON.stringify(data).substr(0, 50);
      eventLog.insertBefore(div, eventLog.firstChild);
      
      // Keep only last 20 events
      while (eventLog.children.length > 20) {
        eventLog.removeChild(eventLog.lastChild);
      }
    }
    
    cs.on('connection', () => {
      status.textContent = '✓ Connected';
      status.className = 'status connected';
      logEvent('connection', {});
    });
    
    cs.on('disconnect', () => {
      status.textContent = '✗ Disconnected';
      status.className = 'status disconnected';
      logEvent('disconnect', {});
    });
    
    // Listen for schema events
    cs.on('schema:post:created', (data) => {
      logEvent('post:created', data);
      console.log('New post created:', data);
      // Could update UI here
    });
    
    cs.on('schema:post:updated', (data) => {
      logEvent('post:updated', data);
      console.log('Post updated:', data);
    });
    
    cs.on('schema:post:deleted', (data) => {
      logEvent('post:deleted', data);
      console.log('Post deleted:', data);
    });
    
    // Real-time post updates
    cs.on('Post:created', (post) => {
      logEvent('Post:created', post);
      console.log('Real-time post created:', post);
    });
    
    cs.on('Post:updated', (post) => {
      logEvent('Post:updated', post);
      console.log('Real-time post updated:', post);
    });
  </script>
</body>
</html>
            `;
            
            res.send(html);
          } else {
            res.status(500).send('View not found');
          }
        } catch (error) {
          console.error('Route error:', error);
          res.status(500).send(`Error: ${error.message}`);
        }
      });
      
      console.log(`  ✓ GET ${routePath}`);
    }
  }
}

// WebSocket connection handling
cs.on('connection', (client) => {
  console.log(`✓ Client connected: ${client.id}`);
  
  // Send welcome message
  cs.wsHub.emit(client, 'welcome', {
    message: 'Connected to CentralStation',
    schemas: Object.keys(schemas)
  });
});

cs.on('disconnect', (client) => {
  console.log(`✗ Client disconnected: ${client.id}`);
});

// Demo: Broadcast server time every 5 seconds
setInterval(() => {
  cs.broadcast('server:time', {
    time: new Date().toISOString(),
    uptime: process.uptime()
  });
}, 5000);

// Start server
cs.start().then(() => {
  console.log('\n🚂 CentralStation + Schema Server Running!');
  console.log('   • HTTP + WebSocket: http://localhost:3000');
  console.log('   • Real-time updates enabled');
  console.log('   • Schemas loaded:', Object.keys(schemas).join(', '));
  console.log('\n');
});

