// Client-side CentralStation - Browser WebSocket wrapper
(function(global) {
  'use strict';

  class CentralStationClient {
    constructor(url) {
      this.url = url || `ws://${location.host}/ws`;
      this.ws = null;
      this.events = new Map();
      this.reconnectDelay = 1000;
      this.maxReconnectDelay = 30000;
      this.currentDelay = this.reconnectDelay;
      this.shouldReconnect = true;
      
      this.connect();
    }

    connect() {
      this.ws = new WebSocket(this.url);
      
      this.ws.onopen = () => {
        console.log('✓ Connected to CentralStation');
        this.currentDelay = this.reconnectDelay;
        this.trigger('connection', {});
      };
      
      this.ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          this.trigger(message.event, message.data);
        } catch (err) {
          console.error('Invalid message:', err);
        }
      };
      
      this.ws.onclose = () => {
        console.log('✗ Disconnected from CentralStation');
        this.trigger('disconnect', {});
        
        if (this.shouldReconnect) {
          setTimeout(() => this.connect(), this.currentDelay);
          this.currentDelay = Math.min(this.currentDelay * 2, this.maxReconnectDelay);
        }
      };
      
      this.ws.onerror = (err) => {
        console.error('WebSocket error:', err);
        this.trigger('error', err);
      };
    }

    on(event, handler) {
      if (!this.events.has(event)) {
        this.events.set(event, []);
      }
      this.events.get(event).push(handler);
      return this;
    }

    off(event, handler) {
      const handlers = this.events.get(event);
      if (handlers) {
        const index = handlers.indexOf(handler);
        if (index > -1) {
          handlers.splice(index, 1);
        }
      }
      return this;
    }

    emit(event, data) {
      if (this.ws.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify({ event, data }));
      } else {
        console.warn('WebSocket not open, queueing message');
        // Could implement message queue here
      }
      return this;
    }

    trigger(event, data) {
      const handlers = this.events.get(event);
      if (handlers) {
        handlers.forEach(handler => {
          try {
            handler(data);
          } catch (err) {
            console.error(`Error in handler for ${event}:`, err);
          }
        });
      }
    }

    close() {
      this.shouldReconnect = false;
      if (this.ws) {
        this.ws.close();
      }
    }
  }

  // Export for different environments
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = CentralStationClient;
  } else {
    global.CentralStation = CentralStationClient;
  }

})(typeof window !== 'undefined' ? window : this);

