// Express server provider with WebSocket support
const express = require('express');
const http = require('http');
const WebServer = require('../WebServer');
const WebSocketHub = require('../WebSocketHub');

class ExpressProvider extends WebServer {
  constructor(port) {
    super(port);
    this.app = express();
    this.server = http.createServer(this.app);
    this.wsHub = new WebSocketHub(this.server);
  }

  _registerRoute(path, method, handlers) {
    const expressMethod = method.toLowerCase();
    this.app[expressMethod](path, ...handlers);
  }

  _registerMiddleware(middleware) {
    this.app.use(middleware);
  }

  _registerWSEvent(event, handler) {
    this.wsHub.on(event, handler);
  }

  _emitWS(event, data) {
    // Emit to last client (for response pattern)
    const clients = Array.from(this.wsHub.clients);
    if (clients.length > 0) {
      this.wsHub.emit(clients[clients.length - 1], event, data);
    }
  }

  _broadcastWS(event, data) {
    this.wsHub.broadcast(event, data);
  }

  start() {
    return new Promise((resolve) => {
      this.server.listen(this.port, () => {
        console.log(`✓ Express server listening on http://localhost:${this.port}`);
        console.log(`✓ WebSocket available at ws://localhost:${this.port}/ws`);
        resolve();
      });
    });
  }

  stop() {
    return new Promise((resolve) => {
      this.wsHub.close();
      this.server.close(() => {
        console.log('Server stopped');
        resolve();
      });
    });
  }
}

module.exports = ExpressProvider;

