# CentralStation 🚂

**Unified HTTP + WebSocket server abstraction for real-time Node.js applications**

## Overview

CentralStation provides a single, streamlined API for building real-time web applications with both HTTP and WebSocket communication. Switch between server providers (native `http`, `express`, `koa`, etc.) without changing your application code.

## Philosophy

- **Unified API** - Same interface for HTTP routes, middleware, and WebSocket events
- **Event-Oriented** - Client and server use identical `on`/`emit` patterns
- **Provider-Agnostic** - Switch between http/express/koa with one line
- **Real-Time First** - WebSocket support built-in, not bolted on
- **Middleware Pipeline** - Process requests and events uniformly

## Installation

```bash
npm install ws express  # or your preferred provider
```

## Quick Start

### Server

```javascript
const CentralStation = require('./src/centralstation');

// Create server (http, express, koa)
const cs = CentralStation({ type: 'express', port: 3000 });

// HTTP Middleware
cs.use((req, res, next) => {
  console.log(req.method, req.url);
  next();
});

// HTTP Routes
cs.route('/', 'GET', (req, res) => {
  res.send('Hello CentralStation!');
});

// WebSocket Events
cs.on('chat:message', (data, client) => {
  console.log('Message from', client.id, ':', data.text);
  cs.broadcast('chat:message', data); // Send to all clients
});

cs.on('connection', (client) => {
  console.log('Client connected:', client.id);
});

cs.start();
```

### Client

```html
<script src="/centralstation.js"></script>
<script>
  const cs = new CentralStation();
  
  // Listen for events
  cs.on('connection', () => {
    console.log('Connected!');
  });
  
  cs.on('chat:message', (data) => {
    console.log('Message:', data.text);
  });
  
  // Send events
  cs.emit('chat:message', { text: 'Hello!' });
</script>
```

## Core Concepts

### 1. HTTP + WebSocket Unified

```javascript
// HTTP request
cs.route('/api/users', 'GET', (req, res) => {
  res.json(users);
});

// WebSocket event
cs.on('user:update', (data, client) => {
  updateUser(data);
  cs.broadcast('user:updated', data);
});
```

### 2. Event Hub

Both client and server use the same event pattern:

**Server:**
```javascript
cs.on('mouse:move', (data, client) => {
  console.log('Mouse at', data.x, data.y);
});

cs.broadcast('server:time', { time: Date.now() });
```

**Client:**
```javascript
cs.on('server:time', (data) => {
  console.log('Server time:', data.time);
});

cs.emit('mouse:move', { x: 100, y: 200 });
```

### 3. Middleware Pipeline

```javascript
// Logging
cs.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// Authentication
cs.use((req, res, next) => {
  if (!req.headers.authorization) {
    return res.status(401).send('Unauthorized');
  }
  next();
});

// Body parsing (with Express)
cs.use(require('express').json());
```

### 4. Provider System

Switch providers without changing code:

```javascript
// Native HTTP
const cs = CentralStation({ type: 'http', port: 3000 });

// Express
const cs = CentralStation({ type: 'express', port: 3000 });

// Custom provider
CentralStation.registerProvider('koa', MyKoaProvider);
const cs = CentralStation({ type: 'koa', port: 3000 });
```

## API Reference

### Server API

#### `CentralStation(options)`
Create a new server instance.

```javascript
const cs = CentralStation({
  type: 'express',  // 'http', 'express'
  port: 3000
});
```

#### `cs.route(path, method, ...handlers)`
Register an HTTP route.

```javascript
cs.route('/', 'GET', (req, res) => {
  res.send('Hello!');
});

cs.route('/api/data', 'POST', 
  validateMiddleware,
  (req, res) => {
    res.json({ ok: true });
  }
);
```

#### `cs.use(middleware)`
Register middleware.

```javascript
cs.use((req, res, next) => {
  console.log(req.url);
  next();
});
```

#### `cs.on(event, handler)`
Listen for WebSocket events.

```javascript
cs.on('chat:message', (data, client) => {
  console.log('From', client.id, ':', data);
});
```

#### `cs.emit(event, data)`
Send to specific client (last connected).

```javascript
cs.emit('notification', { text: 'Hello!' });
```

#### `cs.broadcast(event, data)`
Send to all connected clients.

```javascript
cs.broadcast('server:update', { status: 'ok' });
```

#### `cs.start()` / `cs.stop()`
Start or stop the server.

```javascript
await cs.start();
// ...
await cs.stop();
```

### Client API

#### `new CentralStation(url)`
Connect to server.

```javascript
const cs = new CentralStation(); // Auto-detect URL
const cs = new CentralStation('ws://localhost:3000/ws');
```

#### `cs.on(event, handler)`
Listen for events.

```javascript
cs.on('message', (data) => {
  console.log('Received:', data);
});
```

#### `cs.emit(event, data)`
Send event to server.

```javascript
cs.emit('message', { text: 'Hello!' });
```

#### `cs.off(event, handler)`
Remove event listener.

```javascript
const handler = (data) => console.log(data);
cs.on('event', handler);
cs.off('event', handler);
```

## Examples

### Real-Time Chat

```javascript
const cs = CentralStation({ type: 'express', port: 3000 });

cs.route('/', 'GET', (req, res) => {
  res.sendFile(__dirname + '/chat.html');
});

cs.on('connection', (client) => {
  client.data.username = 'Guest' + Math.floor(Math.random() * 1000);
  cs.broadcast('user:joined', { username: client.data.username });
});

cs.on('chat:message', (data, client) => {
  cs.broadcast('chat:message', {
    username: client.data.username,
    text: data.text,
    time: new Date().toISOString()
  });
});

cs.start();
```

### Live Dashboard

```javascript
// Server pushes metrics every second
setInterval(() => {
  cs.broadcast('metrics:update', {
    cpu: process.cpuUsage(),
    memory: process.memoryUsage(),
    uptime: process.uptime()
  });
}, 1000);

// Client displays live data
cs.on('metrics:update', (data) => {
  document.getElementById('cpu').textContent = data.cpu;
  document.getElementById('memory').textContent = data.memory;
});
```

### Collaborative Editor

```javascript
// Broadcast changes to all other clients
cs.on('doc:edit', (data, client) => {
  cs.wsHub.broadcastExcept(client, 'doc:edit', data);
});

// Client syncs changes
let localEdit = false;

editor.on('change', (delta) => {
  if (!localEdit) {
    cs.emit('doc:edit', delta);
  }
});

cs.on('doc:edit', (delta) => {
  localEdit = true;
  editor.applyDelta(delta);
  localEdit = false;
});
```

## Architecture

```
┌─────────────────────────────────────┐
│         CentralStation              │
│  (Factory + Provider Registry)     │
└──────────┬──────────────────────────┘
           │
           ├─── WebServer (Abstract)
           │     ├─── route()
           │     ├─── use()
           │     ├─── on()
           │     └─── emit()
           │
           ├─── HttpProvider
           │     └─── Native http + middleware
           │
           ├─── ExpressProvider
           │     └─── Express + WebSocket
           │
           └─── WebSocketHub
                 ├─── Connection management
                 ├─── Event routing
                 └─── Broadcast/emit
```

## Integration with Schema System

CentralStation integrates seamlessly with the SOML schema system:

```javascript
const { define } = require('./src/schema');
const cs = CentralStation({ type: 'express', port: 3000 });

define('Post', {
  fields: { title: String, content: String },
  
  events: {
    'post:created': (post) => {
      // Broadcast to all clients
      cs.broadcast('post:created', post);
    }
  }
});

// Client auto-updates
cs.on('post:created', (post) => {
  addPostToUI(post);
});
```

## Running the Demo

```bash
node demo-centralstation.js
```

Open http://localhost:3000 in multiple tabs to see:
- Real-time server time sync
- Mouse movement tracking
- Connected client count
- Event logging

## Why CentralStation?

| Feature | Traditional | CentralStation |
|---------|------------|----------------|
| HTTP + WS | Separate setup | Unified API |
| Middleware | HTTP only | HTTP + WS events |
| Provider Switch | Rewrite code | Change 1 line |
| Client/Server Events | Different APIs | Same `on`/`emit` |
| Real-time | Add-on | Built-in |

## Next Steps

- Add authentication/authorization middleware
- Implement room/channel system for targeted broadcasts
- Add message queuing for offline clients
- Create more providers (Koa, Hapi, Fastify)
- Build higher-level abstractions (RPC, pub/sub)

---

**CentralStation** - Where HTTP meets WebSocket, seamlessly.

