// WebSocket event hub for bidirectional client/server communication
const WebSocket = require('ws');

class WebSocketHub {
  constructor(httpServer) {
    this.wss = new WebSocket.Server({ server: httpServer, path: '/ws' });
    this.clients = new Set();
    this.events = new Map();
    
    this.wss.on('connection', (socket, req) => {
      this._handleConnection(socket, req);
    });
  }

  _handleConnection(socket, req) {
    const client = {
      socket,
      id: this._generateId(),
      req,
      data: {}
    };
    
    this.clients.add(client);
    this.emit('connection', client);
    
    socket.on('message', (raw) => {
      try {
        const message = JSON.parse(raw);
        this._handleMessage(client, message);
      } catch (err) {
        console.error('Invalid WebSocket message:', err);
      }
    });
    
    socket.on('close', () => {
      this.clients.delete(client);
      this.emit('disconnect', client);
    });
    
    socket.on('error', (err) => {
      console.error('WebSocket error:', err);
    });
  }

  _handleMessage(client, message) {
    const { event, data } = message;
    if (!event) return;
    
    const handlers = this.events.get(event);
    if (handlers) {
      handlers.forEach(handler => {
        try {
          handler(data, client);
        } catch (err) {
          console.error(`Error in handler for ${event}:`, err);
        }
      });
    }
  }

  // Register event handler
  on(event, handler) {
    if (!this.events.has(event)) {
      this.events.set(event, []);
    }
    this.events.get(event).push(handler);
  }

  // Emit to specific client
  emit(client, event, data) {
    if (client && client.socket && client.socket.readyState === WebSocket.OPEN) {
      client.socket.send(JSON.stringify({ event, data }));
    }
  }

  // Broadcast to all clients
  broadcast(event, data) {
    const message = JSON.stringify({ event, data });
    this.clients.forEach(client => {
      if (client && client.socket && client.socket.readyState === WebSocket.OPEN) {
        client.socket.send(message);
      }
    });
  }

  // Broadcast to all except one
  broadcastExcept(excludeClient, event, data) {
    const message = JSON.stringify({ event, data });
    this.clients.forEach(client => {
      if (client && client !== excludeClient && client.socket && client.socket.readyState === WebSocket.OPEN) {
        client.socket.send(message);
      }
    });
  }

  _generateId() {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  close() {
    this.clients.forEach(client => client.socket.close());
    this.wss.close();
  }
}

module.exports = WebSocketHub;

