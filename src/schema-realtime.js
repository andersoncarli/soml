// Schema + CentralStation Integration
// Adds real-time capabilities to the schema system

const { define: originalDefine, emitEvent } = require('./schema');
const { on: originalOn, emit: originalEmit } = require('./events');

let centralStation = null;

// Set the CentralStation instance for real-time updates
function setCentralStation(cs) {
  centralStation = cs;
  
  // Forward schema events to WebSocket clients
  if (centralStation) {
    console.log('✓ Real-time schema updates enabled');
  }
}

// Enhanced define that registers WebSocket handlers
function defineRealtime(name, schema) {
  // Call original define
  originalDefine(name, schema);
  
  // Register WebSocket handlers for schema events
  if (centralStation && schema.events) {
    Object.keys(schema.events).forEach(eventName => {
      const handler = schema.events[eventName];
      
      // Wrap handler to broadcast to clients
      const realtimeHandler = (data) => {
        // Call original handler
        handler(data);
        
        // Broadcast to all WebSocket clients
        if (centralStation) {
          centralStation.broadcast(`schema:${eventName}`, {
            schema: name,
            event: eventName,
            data
          });
        }
      };
      
      // Register with event system
      originalOn(eventName, realtimeHandler);
    });
  }
  
  return schema;
}

// Enhanced emit that also broadcasts via WebSocket
function emitRealtime(eventName, data) {
  // Call original emit
  originalEmit(eventName, data);
  
  // Broadcast via WebSocket
  if (centralStation) {
    centralStation.broadcast(`event:${eventName}`, {
      event: eventName,
      data
    });
  }
}

// Create WebSocket routes for CRUD operations
function createRealtimeRoutes(schemaName, schema) {
  if (!centralStation) {
    console.warn('CentralStation not set - real-time routes not created');
    return;
  }
  
  // Listen for client requests
  centralStation.on(`${schemaName}:list`, (data, client) => {
    // Handle list request
    if (schema.api && schema.api.listApi) {
      // Mock req/res for WebSocket
      const req = { query: data };
      const res = {
        json: (result) => {
          centralStation.wsHub.emit(client, `${schemaName}:list:response`, result);
        }
      };
      schema.api.listApi(req, res);
    }
  });
  
  centralStation.on(`${schemaName}:get`, (data, client) => {
    if (schema.api && schema.api.detailApi) {
      const req = { params: { id: data.id } };
      const res = {
        json: (result) => {
          centralStation.wsHub.emit(client, `${schemaName}:get:response`, result);
        }
      };
      schema.api.detailApi(req, res);
    }
  });
  
  centralStation.on(`${schemaName}:create`, (data, client) => {
    if (schema.api && schema.api.createApi) {
      const req = { body: data };
      const res = {
        json: (result) => {
          centralStation.wsHub.emit(client, `${schemaName}:create:response`, result);
          // Broadcast creation to all clients
          centralStation.broadcast(`${schemaName}:created`, result);
        }
      };
      schema.api.createApi(req, res);
    }
  });
  
  centralStation.on(`${schemaName}:update`, (data, client) => {
    if (schema.api && schema.api.updateApi) {
      const req = { params: { id: data.id }, body: data };
      const res = {
        json: (result) => {
          centralStation.wsHub.emit(client, `${schemaName}:update:response`, result);
          // Broadcast update to all clients
          centralStation.broadcast(`${schemaName}:updated`, result);
        }
      };
      schema.api.updateApi(req, res);
    }
  });
  
  centralStation.on(`${schemaName}:delete`, (data, client) => {
    if (schema.api && schema.api.deleteApi) {
      const req = { params: { id: data.id } };
      const res = {
        json: (result) => {
          centralStation.wsHub.emit(client, `${schemaName}:delete:response`, result);
          // Broadcast deletion to all clients
          centralStation.broadcast(`${schemaName}:deleted`, { id: data.id });
        }
      };
      schema.api.deleteApi(req, res);
    }
  });
  
  console.log(`  ✓ Real-time routes created for ${schemaName}`);
}

module.exports = {
  setCentralStation,
  defineRealtime,
  emitRealtime,
  createRealtimeRoutes
};

