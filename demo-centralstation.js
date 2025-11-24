// CentralStation Demo - Real-time mouse tracking + server time
const CentralStation = require('./src/centralstation');
const fs = require('fs');
const path = require('path');

// Create server
const cs = CentralStation({ type: 'express', port: 3000 });

// Middleware - logging
cs.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// Middleware - JSON body parser
cs.use(require('express').json());

// Serve static files
cs.use(require('express').static('public'));

// HTTP Routes
cs.route('/', 'GET', (req, res) => {
  const html = `
<!DOCTYPE html>
<html>
<head>
  <title>CentralStation Demo</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      max-width: 800px;
      margin: 50px auto;
      padding: 20px;
      background: #f5f5f5;
    }
    .container {
      background: white;
      padding: 30px;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    h1 { color: #333; margin-top: 0; }
    .status {
      padding: 10px;
      border-radius: 4px;
      margin: 20px 0;
      font-weight: bold;
    }
    .connected { background: #d4edda; color: #155724; }
    .disconnected { background: #f8d7da; color: #721c24; }
    .info-box {
      background: #e7f3ff;
      padding: 15px;
      border-radius: 4px;
      margin: 10px 0;
      border-left: 4px solid #0066cc;
    }
    .mouse-pos { font-family: monospace; }
    .event-log {
      background: #1e1e1e;
      color: #d4d4d4;
      padding: 15px;
      border-radius: 4px;
      max-height: 200px;
      overflow-y: auto;
      font-family: 'Courier New', monospace;
      font-size: 12px;
    }
    .event-log div { margin: 2px 0; }
    .event-send { color: #4ec9b0; }
    .event-receive { color: #ce9178; }
  </style>
</head>
<body>
  <div class="container">
    <h1>🚂 CentralStation Real-Time Demo</h1>
    
    <div id="status" class="status disconnected">
      Connecting...
    </div>
    
    <div class="info-box">
      <strong>Server Time:</strong> <span id="server-time">--:--:--</span>
    </div>
    
    <div class="info-box">
      <strong>Mouse Position:</strong> 
      <span class="mouse-pos" id="mouse-pos">x: 0, y: 0</span>
    </div>
    
    <div class="info-box">
      <strong>Connected Clients:</strong> <span id="client-count">0</span>
    </div>

    <h3>Event Log</h3>
    <div class="event-log" id="event-log"></div>
  </div>

  <script src="/centralstation.js"></script>
  <script>
    const cs = new CentralStation();
    const log = document.getElementById('event-log');
    const status = document.getElementById('status');
    
    function logEvent(type, event, data) {
      const div = document.createElement('div');
      div.className = 'event-' + type;
      div.textContent = \`[\${type.toUpperCase()}] \${event}: \${JSON.stringify(data)}\`;
      log.appendChild(div);
      log.scrollTop = log.scrollHeight;
      
      // Keep only last 50 events
      while (log.children.length > 50) {
        log.removeChild(log.firstChild);
      }
    }
    
    // Connection status
    cs.on('connection', () => {
      status.textContent = '✓ Connected';
      status.className = 'status connected';
      logEvent('receive', 'connection', {});
    });
    
    cs.on('disconnect', () => {
      status.textContent = '✗ Disconnected';
      status.className = 'status disconnected';
      logEvent('receive', 'disconnect', {});
    });
    
    // Server time updates
    cs.on('server:time', (data) => {
      document.getElementById('server-time').textContent = data.time;
      logEvent('receive', 'server:time', data);
    });
    
    // Client count updates
    cs.on('clients:count', (data) => {
      document.getElementById('client-count').textContent = data.count;
      logEvent('receive', 'clients:count', data);
    });
    
    // Mouse tracking
    let lastSend = 0;
    const throttle = 50; // ms
    
    document.addEventListener('mousemove', (e) => {
      const now = Date.now();
      if (now - lastSend > throttle) {
        const data = { x: e.clientX, y: e.clientY };
        cs.emit('mouse:move', data);
        document.getElementById('mouse-pos').textContent = \`x: \${data.x}, y: \${data.y}\`;
        logEvent('send', 'mouse:move', data);
        lastSend = now;
      }
    });
  </script>
</body>
</html>
  `;
  res.send(html);
});

// API endpoint
cs.route('/api/status', 'GET', (req, res) => {
  res.json({
    server: 'CentralStation',
    uptime: process.uptime(),
    clients: cs.wsHub.clients.size
  });
});

// WebSocket Events
cs.on('connection', (client) => {
  console.log(`✓ Client connected: ${client.id}`);
  
  // Send initial data
  cs.wsHub.emit(client, 'server:time', { time: new Date().toLocaleTimeString() });
  
  // Broadcast client count
  cs.broadcast('clients:count', { count: cs.wsHub.clients.size });
});

cs.on('disconnect', (client) => {
  console.log(`✗ Client disconnected: ${client.id}`);
  cs.broadcast('clients:count', { count: cs.wsHub.clients.size });
});

cs.on('mouse:move', (data, client) => {
  // Log mouse movement (throttled on server side too)
  // Could broadcast to other clients for multi-user demos
});

// Send server time every second
setInterval(() => {
  cs.broadcast('server:time', { time: new Date().toLocaleTimeString() });
}, 1000);

// Copy client library to public
const clientLib = fs.readFileSync(path.join(__dirname, 'src/centralstation/client.js'), 'utf8');
if (!fs.existsSync('public')) fs.mkdirSync('public');
fs.writeFileSync('public/centralstation.js', clientLib);

// Start server
cs.start().then(() => {
  console.log('\n🚂 CentralStation Demo Running!');
  console.log('   Open http://localhost:3000 in multiple browser tabs');
  console.log('   Move your mouse to see real-time updates\n');
});

