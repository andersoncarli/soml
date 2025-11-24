// Abstract WebServer class - defines the unified API for HTTP + WebSocket
class WebServer {
  constructor(port) {
    if (new.target === WebServer) {
      throw new TypeError('Cannot construct WebServer directly - use a provider');
    }
    this.port = port;
    this.server = null;
    this.middlewares = [];
    this.routes = new Map();
    this.wsEvents = new Map();
  }

  // HTTP Methods
  route(path, method, ...handlers) {
    const key = `${method.toUpperCase()} ${path}`;
    this.routes.set(key, handlers);
    this._registerRoute(path, method, handlers);
  }

  use(middleware) {
    this.middlewares.push(middleware);
    this._registerMiddleware(middleware);
  }

  // WebSocket Methods
  on(event, handler) {
    if (!this.wsEvents.has(event)) {
      this.wsEvents.set(event, []);
    }
    this.wsEvents.get(event).push(handler);
    this._registerWSEvent(event, handler);
  }

  emit(event, data) {
    this._emitWS(event, data);
  }

  broadcast(event, data) {
    this._broadcastWS(event, data);
  }

  // Lifecycle
  start() {
    throw new Error('Must implement start()');
  }

  stop() {
    throw new Error('Must implement stop()');
  }

  // Provider-specific implementations
  _registerRoute(path, method, handlers) {
    throw new Error('Must implement _registerRoute()');
  }

  _registerMiddleware(middleware) {
    throw new Error('Must implement _registerMiddleware()');
  }

  _registerWSEvent(event, handler) {
    throw new Error('Must implement _registerWSEvent()');
  }

  _emitWS(event, data) {
    throw new Error('Must implement _emitWS()');
  }

  _broadcastWS(event, data) {
    throw new Error('Must implement _broadcastWS()');
  }
}

module.exports = WebServer;

