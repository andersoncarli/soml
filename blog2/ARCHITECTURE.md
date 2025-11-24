# Blog2 Architecture - Clean Component-Based Design

## Overview

Blog2 has been completely refactored to follow clean architecture principles:
- **No inline HTML** in server.js
- **.soml.js component files** like JSX
- **Minimal server** - just routes and WebSocket handlers
- **Everything from schemas** - data-driven design

## Project Structure

```
blog2/
├── server.js                    # Minimal server (< 100 lines)
├── store.js                     # Data management
├── components/                  # Reusable UI components
│   ├── Layout.soml.js          # Page wrapper with styles
│   ├── Navbar.soml.js          # Navigation bar
│   ├── PostCard.soml.js        # Post card for lists
│   ├── CommentItem.soml.js     # Single comment
│   └── CommentForm.soml.js     # Comment input form
├── pages/                       # Full page components
│   ├── HomePage.soml.js        # Blog listing page
│   └── PostDetailPage.soml.js  # Post + comments page
└── schemas/                     # Data schemas (future)
    ├── Post.js
    └── Comment.js
```

## Architecture Principles

### 1. Component-Based UI

Every UI element is a **.soml.js file** that exports a function:

```javascript
// components/PostCard.soml.js
const { soml } = require('../../src/soml');

const PostCard = (post) => soml({
  div: {
    class: 'card',
    children: [
      { h5: { content: post.title } },
      { p: { content: post.excerpt } }
    ]
  }
});

module.exports = PostCard;
```

**Benefits:**
- Clear separation of concerns
- Reusable across pages
- Easy to test
- No inline HTML strings

### 2. Page Composition

Pages import and compose components:

```javascript
// pages/HomePage.soml.js
const Layout = require('../components/Layout.soml');
const Navbar = require('../components/Navbar.soml');
const PostCard = require('../components/PostCard.soml');

const HomePage = ({ posts, onlineCount }) => {
  const content = soml({
    div: {
      children: [
        Navbar({ brand: 'Blog2', links: [...] }),
        { div: { children: posts.map(PostCard) } }
      ]
    }
  });
  
  return Layout({ title: 'Blog2', children: content });
};
```

**Benefits:**
- Declarative structure
- Component reuse
- Clear data flow
- Easy to understand

### 3. Minimal Server

Server.js is just routing and WebSocket handling:

```javascript
// blog2/server.js (simplified)
const HomePage = require('./pages/HomePage.soml');
const store = require('./store');

// HTTP Routes
cs.route('/blog2', 'GET', (req, res) => {
  const html = soml.toHtml(HomePage({
    posts: store.getPosts(),
    onlineCount: store.getOnlineCount()
  }));
  res.send(html);
});

// WebSocket Events
cs.on('comment:create', (data, client) => {
  const comment = store.addComment(data.postId, data);
  cs.broadcast('comment:created', comment);
});
```

**Benefits:**
- Easy to read
- Clear responsibilities
- No business logic in routes
- Testable handlers

### 4. Data Store

Centralized data management in `store.js`:

```javascript
// store.js
module.exports = {
  getPosts: () => store.posts,
  getPost: (id) => store.posts.find(p => p.id === id),
  getComments: (postId) => store.comments[postId] || [],
  addComment: (postId, data) => { /* ... */ },
  likeComment: (postId, commentId) => { /* ... */ },
  getOnlineCount: () => store.onlineUsers.size
};
```

**Benefits:**
- Single source of truth
- Easy to swap for database
- Clear API
- Testable

## Component Hierarchy

```
Layout
├── Navbar
└── Page Content
    ├── HomePage
    │   └── PostCard (multiple)
    └── PostDetailPage
        ├── Post Detail
        ├── CommentItem (multiple)
        └── CommentForm
```

## Data Flow

### Page Rendering
```
1. HTTP Request → Server
2. Server → Store (get data)
3. Store → Server (return data)
4. Server → Page Component (pass data)
5. Page → Child Components (compose)
6. Component → SOML → HTML
7. HTML → Client
```

### Real-Time Updates
```
1. User Action → Browser
2. Browser → WebSocket Event
3. Server receives event
4. Server → Store (update data)
5. Server → Broadcast to all clients
6. Clients receive update
7. JavaScript updates DOM
```

## Key Technologies

- **SOML**: Declarative UI as JavaScript objects
- **CentralStation**: Unified HTTP + WebSocket server
- **Express**: HTTP routing (via CentralStation)
- **WebSocket**: Real-time bidirectional communication
- **Bootstrap 5**: CSS framework

## Best Practices

### Component Design

1. **Pure Functions**: Components are functions that take data and return SOML
2. **No Side Effects**: Components don't mutate data or make API calls
3. **Composition**: Build complex UIs from simple components
4. **Props**: Pass data explicitly via parameters

### File Organization

1. **One Component Per File**: Each .soml.js exports one component
2. **Clear Names**: PostCard, CommentForm, HomePage
3. **Logical Grouping**: components/, pages/, schemas/
4. **Module Exports**: Always `module.exports = Component`

### Data Management

1. **Centralized Store**: All data in one place
2. **Clear API**: Functions with clear names and purposes
3. **Immutability**: Don't mutate store data directly
4. **Real-Time Sync**: WebSocket broadcasts keep clients in sync

## Comparison to Previous Version

### Before (Inline HTML)
```javascript
// server.js - 400+ lines with HTML strings
cs.route('/blog2', 'GET', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Blog2</title>
        <style>
          body { ... }
        </style>
      </head>
      <body>
        <nav>...</nav>
        <div class="container">
          ${posts.map(post => `
            <div class="card">
              <h5>${post.title}</h5>
              ...
            </div>
          `).join('')}
        </div>
      </body>
    </html>
  `);
});
```

**Problems:**
- ❌ HTML mixed with logic
- ❌ Hard to maintain
- ❌ No reusability
- ❌ Difficult to test

### After (Component-Based)
```javascript
// server.js - 100 lines, no HTML
const HomePage = require('./pages/HomePage.soml');

cs.route('/blog2', 'GET', (req, res) => {
  const html = soml.toHtml(HomePage({
    posts: store.getPosts(),
    onlineCount: store.getOnlineCount()
  }));
  res.send(html);
});
```

**Benefits:**
- ✅ Clean separation
- ✅ Easy to maintain
- ✅ Reusable components
- ✅ Testable

## Real-Time Features

All real-time features use CentralStation's unified WebSocket API:

### Server-Side
```javascript
cs.on('comment:create', (data, client) => {
  const comment = store.addComment(data.postId, data);
  cs.broadcast('comment:created', comment);
});
```

### Client-Side (in page components)
```javascript
{
  script: {
    content: `
      const cs = new CentralStation();
      
      cs.on('comment:created', (comment) => {
        addCommentToUI(comment);
        updateCommentCount();
      });
      
      cs.emit('comment:create', { postId, author, content });
    `
  }
}
```

## Future Enhancements

### 1. Database Integration
Replace store.js with database:
```javascript
// store.js → db.js
const { MongoClient } = require('mongodb');
module.exports = {
  getPosts: async () => await db.collection('posts').find().toArray(),
  // ...
};
```

### 2. Component Library
Extract components to separate package:
```javascript
const { PostCard, CommentForm } = require('@blog2/components');
```

### 3. Server-Side Rendering
Pre-render pages for SEO:
```javascript
const html = soml.toHtml(HomePage({ posts, onlineCount }));
const fullPage = `<!DOCTYPE html>${html}`;
```

### 4. Client-Side Hydration
Make pages interactive after load:
```javascript
// Render on server
const html = soml.toHtml(HomePage({ posts }));

// Hydrate on client
CentralStation.hydrate(HomePage, { posts });
```

## Running Blog2

```bash
# Start server
node blog2/server.js

# Open in browser
http://localhost:3000/blog2

# Open in multiple tabs to see real-time updates
```

## Testing Components

```javascript
// test/components/PostCard.test.js
const PostCard = require('../../blog2/components/PostCard.soml');
const { soml } = require('../../src/soml');

const post = {
  id: '1',
  title: 'Test Post',
  excerpt: 'Test excerpt',
  author: 'Test Author'
};

const html = soml.toHtml(PostCard(post));
assert(html.includes('Test Post'));
assert(html.includes('Test Author'));
```

## Summary

Blog2 now follows modern web development best practices:

✅ **Component-Based** - Reusable .soml.js files  
✅ **Clean Architecture** - Clear separation of concerns  
✅ **Minimal Server** - Just routing, no HTML  
✅ **Real-Time First** - WebSocket throughout  
✅ **Maintainable** - Easy to understand and modify  
✅ **Testable** - Components are pure functions  
✅ **Scalable** - Add features without complexity  

This architecture provides a solid foundation for building modern, real-time web applications with clean, maintainable code.

---

**Blog2** - Clean, component-based, real-time blogging. 🚂✨

