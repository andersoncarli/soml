// Event system inspired by CentralStation
class EventEmitter {
  constructor() {
    this.events = new Map();
  }

  on(event, handler) {
    if (!this.events.has(event)) {
      this.events.set(event, []);
    }
    this.events.get(event).push(handler);
    
    // Return unsubscribe function
    return () => this.off(event, handler);
  }

  off(event, handler) {
    if (!this.events.has(event)) return;
    
    const handlers = this.events.get(event);
    const index = handlers.indexOf(handler);
    
    if (index > -1) {
      handlers.splice(index, 1);
    }
    
    // Clean up if no handlers left
    if (handlers.length === 0) {
      this.events.delete(event);
    }
  }

  emit(event, data) {
    if (!this.events.has(event)) return;
    
    const handlers = this.events.get(event);
    handlers.forEach(handler => {
      try {
        handler(data);
      } catch (error) {
        console.error(`Error in event handler for '${event}':`, error);
      }
    });
  }

  once(event, handler) {
    const wrapper = (data) => {
      handler(data);
      this.off(event, wrapper);
    };
    this.on(event, wrapper);
  }

  clear(event) {
    if (event) {
      this.events.delete(event);
    } else {
      this.events.clear();
    }
  }

  listEvents() {
    return Array.from(this.events.keys());
  }

  listenerCount(event) {
    return this.events.has(event) ? this.events.get(event).length : 0;
  }
}

// Global event emitter
const events = new EventEmitter();

module.exports = { EventEmitter, events };

