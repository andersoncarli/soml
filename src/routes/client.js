// routes/client.js
const express = require('express');
const router = express.Router();
const { soml } = require('../soml');
const { db } = require('../db');

const renderPage = (title, content) => {
  const page = {
    html: {
      lang: 'en',
      head: {
        meta: { charset: 'UTF-8' },
        title: title,
        style: `
          body { font-family: system-ui, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
          nav { margin-bottom: 20px; padding: 10px; background: #f0f0f0; }
          nav a { margin-right: 15px; text-decoration: none; color: #0066cc; }
          .post { border: 1px solid #ddd; padding: 15px; margin-bottom: 15px; border-radius: 5px; }
          .post h3 { margin-top: 0; }
          form { margin-top: 20px; }
          input, textarea { display: block; width: 100%; margin-bottom: 10px; padding: 8px; }
          button { padding: 10px 20px; background: #0066cc; color: white; border: none; cursor: pointer; }
        `
      },
      body: {
        nav: [
          { a: { href: '/', content: 'Home' } },
          { a: { href: '/posts', content: 'Posts' } },
          { a: { href: '/tasks', content: 'Tasks' } }
        ],
        children: content
      }
    }
  };
  return '<!DOCTYPE html>' + soml.toHtml(page);
};

router.get('/', (req, res) => {
  const content = {
    h1: 'Welcome to SOML Blog',
    p: 'A simple blog built with SOML and Express'
  };
  res.send(renderPage('Home', content));
});

router.get('/posts', async (req, res) => {
  try {
    const dbConn = await db.connect();
    const posts = await dbConn.collection('posts').find({}).limit(20).toArray();
    
    const content = [
      { h1: 'Blog Posts' },
      { div: { class: 'posts', children: posts.map(post => ({
        div: { class: 'post', children: [
          { h3: post.title },
          { p: post.content },
          { small: `by ${post.authorId} - ${new Date(post.createdAt).toLocaleDateString()}` }
        ]}
      }))}},
      { h2: 'Create New Post' },
      { form: { method: 'POST', action: '/api/posts', children: [
        { input: { type: 'text', name: 'title', placeholder: 'Title', required: true } },
        { textarea: { name: 'content', placeholder: 'Content', rows: 5, required: true } },
        { button: { type: 'submit', content: 'Create Post' } }
      ]}}
    ];
    res.send(renderPage('Posts', content));
  } catch (error) {
    res.send(renderPage('Posts', { 
      h1: 'Blog Posts',
      p: 'No posts yet. Database connection may be needed.' 
    }));
  }
});

router.get('/tasks', async (req, res) => {
  try {
    const dbConn = await db.connect();
    const tasks = await dbConn.collection('tasks').find({}).limit(20).toArray();
    
    const content = [
      { h1: 'Tasks' },
      { ul: tasks.map(task => ({
        li: `${task.description} ${task.completed ? '✓' : ''}`
      }))}
    ];
    res.send(renderPage('Tasks', content));
  } catch (error) {
    res.send(renderPage('Tasks', { 
      h1: 'Tasks',
      p: 'No tasks yet. Database connection may be needed.' 
    }));
  }
});

module.exports = router;