// server/server.js
const http = require('http');
const url = require('url');
const soml = require('../utils/soml-utils');
const { Post } = require('./db');
const { Container, Row, Col, Navbar, Footer, Button } = require('../components/soml-components');

const routes = {
  '/': {
    Navbar: {}, Container: {
      Row: {
        Col: {
          h1: 'Welcome to the SOML Blog',
          p: 'This is a sample blog application.'
        }
      }
    },
    Footer: {}
  },
  '/posts': {
    Navbar: {}, Container: {
      post: Post.find(),
      Row: this.posts.map(post => ({
        Col: {
          h2: post.title,
          p: post.content
        }
      }))
    },
    Footer: {}
  },
  '/about': {
    Navbar: {}, Container: {
      Row: {
        Col: {
          h1: 'About SOML Blog',
          p: 'This blog application is built using SOML and MongoDB.'
        }
      }
    },
    Footer: {}
  },
  'default': () => {
    res.writeHead(404);
    res.end('Not Found')
  }
}

const server = http.createServer(async (req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;
  let page = routes[pathname] || routes['default'];
  res.writeHead(200, { 'Content-Type': 'text/html' });
  res.end(soml.html(page));
});

server.listen(3000, () => console.log('Server running on http://localhost:3000'));
