
// server.js
// 3. Server Setup with Directory Routing and Middleware
// We’ll handle routing and middleware using object mapping and register routes dynamically.

const http = require('http');
const url = require('url');
const { soml } = require('./soml');
const { MongoClient } = require('mongodb');
const path = require('path');
const fs = require('fs');
const mime = require('mime');

const port = 3000;

// MongoDB connection
const client = new MongoClient('mongodb://localhost:27017');
client.connect();
const db = client.db('blog');

const routes = require('./routes.js')

const renderPage = (pageName, req, res, props = {}) => {
  const Component = soml.registry[pageName];
  if (!Component) {
    res.writeHead(404);
    res.end('Page not found');
    return;
  }
  const content = Component(props);
  res.writeHead(200, { 'Content-Type': 'text/html' });
  res.end(renderSomlToHtml(content));
};

const server = http.createServer(async (req, res) => {
  const pathname = url.parse(req.url).pathname;

  if (apiRoutes[pathname]) {
    if (req.method === 'POST') {
      let body = '';
      req.on('data', chunk => body += chunk);
      req.on('end', () => {
        req.body = body;
        apiRoutes[pathname](req, res);
      });
    }
  } else if (routes[pathname]) {
    routes[pathname](req, res);
  } else {
    res.writeHead(404);
    res.end('Not found');
  }
});

server.listen(port, () => {
  console.log(`Server running at http://localhost:${port}/`);
});

function renderSomlToHtml(somlObj) {
  // Convert SOML object to HTML string
  // Implement rendering logic here
  return '<html></html>'; // Placeholder
}
