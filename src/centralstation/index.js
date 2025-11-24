// CentralStation - Unified HTTP + WebSocket server
const providers = {
  http: require('./providers/http'),
  express: require('./providers/express')
};

function CentralStation(options = {}) {
  const { type = 'http', port = 3000 } = options;
  
  const Provider = providers[type];
  if (!Provider) {
    throw new Error(`Unknown provider: ${type}. Available: ${Object.keys(providers).join(', ')}`);
  }
  
  return new Provider(port);
}

// Expose provider registration
CentralStation.registerProvider = (name, ProviderClass) => {
  providers[name] = ProviderClass;
};

// Expose base classes for extensions
CentralStation.WebServer = require('./WebServer');
CentralStation.WebSocketHub = require('./WebSocketHub');

module.exports = CentralStation;

