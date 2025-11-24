// Native HTTP server provider with WebSocket support
const http = require('http');
const WebServer = require('../WebServer');
const WebSocketHub = require('../WebSocketHub');

class HttpProvider extends WebServer {
  constructor(port) {
    super(port);
    this.handlers = [];
    this.server = http.createServer((req, res) => this._handleRequest(req, res));
    this.wsHub = new WebSocketHub(this.server);
  }

  _handleRequest(req, res) {
    // Run middleware pipeline
    const ctx = { req, res, data: {} };
    this._runMiddleware(ctx, 0, () => {
      // Match route
      const key = `${req.method} ${req.url}`;
      const handlers = this.routes.get(key);
      
      if (handlers) {
        this._runHandlers(ctx, handlers, 0);
      } else {
        res.statusCode = 404;
        res.end('Not Found');
      }
    });
  }

  _runMiddleware(ctx, index, next) {
    if (index >= this.middlewares.length) {
      return next();
    }
    
    const middleware = this.middlewares[index];
    try {
      middleware(ctx.req, ctx.res, () => {
        this._runMiddleware(ctx, index + 1, next);
      });
    } catch (err) {
      console.error('Middleware error:', err);
      ctx.res.statusCode = 500;
      ctx.res.end('Internal Server Error');
    }
  }

  _runHandlers(ctx, handlers, index) {
    if (index >= handlers.length) {
      return;
    }
    
    const handler = handlers[index];
    try {
      handler(ctx.req, ctx.res, () => {
        this._runHandlers(ctx, handlers, index + 1);
      });
    } catch (err) {
      console.error('Handler error:', err);
      ctx.res.statusCode = 500;
      ctx.res.end('Internal Server Error');
    }
  }

  _registerRoute(path, method, handlers) {
    // Routes are stored in the base class Map
  }

  _registerMiddleware(middleware) {
    // Middleware is stored in the base class array
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
        console.log(`✓ HTTP server listening on http://localhost:${this.port}`);
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

module.exports = HttpProvider;

