# blog2 Integration Guide

## Missing Dependencies Found

### Files blog2 Requires That Don't Exist

```javascript
// 1. blog2/soml.js:2
require('../components/soml-components')  ❌ NOT FOUND

// 2. blog2/blog.soml.js:2  
require('../utils/soml-utils')  ❌ NOT FOUND

// 3. blog2/server0.js:5
require('./db')  ❌ NOT FOUND (only blog.db.js exists)

// 4. blog2/ToDo.js:2
require('./db')  ❌ NOT FOUND
```

### NPM Packages Not in Dependencies

```json
{
  "mime": "^2.5.2",      // Used in blog2/server.js:12 ❌
  "mongoose": "^6.0.0"   // Used in blog2/blog.db.js:2 ❌
}
```

### Missing Implementations

```javascript
// 1. soml.registry - Component registry system
soml.registry['Home']  ❌ undefined

// 2. renderSomlToHtml - Placeholder function
function renderSomlToHtml(somlObj) {
  return '<html></html>';  // ❌ Stub
}
```

---

## What CAN Be Integrated

### ✅ 1. Extended Entity Models (High Value)

**File**: `blog2/Model.js`
**Status**: ✅ Ready to integrate
**Action**: Merge into `/src/model.js`

```bash
# Preview what would be added
diff /home/bittnkr/soml/src/model.js /home/bittnkr/soml/blog2/Model.js
```

**Integration**:
```javascript
// Merge blog2/Model.js into /src/model.js
module.exports = {
  // Current (keep)
  User: {
    "id#": "autoinc",
    "name!": "",
    "email!#": ""
  },
  Post: {
    "id!#": "autoinc",
    "authorId!": 'User',
    "title!": "",
    "content!": ""
  },
  Task: {
    "id#": "autoinc",
    "userId!": 'User',
    "description!": "",
    "completed": false
  },
  State: {
    "id#": "autoinc",
    "userId!": 'User',
    "state": {}
  },
  
  // Add from blog2/Model.js (expand with proper notation)
  Comment: {
    "id#": "autoinc",
    "postId!": "Post",
    "authorId!": "User",
    "content!": "",
    "createdAt": { type: 'date', default: () => Date.now() }
  },
  
  Category: {
    "id#": "autoinc",
    "name!": "",
    "description": "",
    "createdAt": { type: 'date', default: () => Date.now() }
  },
  
  Image: {
    "id#": "autoinc",
    "url!": "",
    "altText": "",
    "uploadedAt": { type: 'date', default: () => Date.now() }
  },
  
  Widget: {
    "id#": "autoinc",
    "type!": "",
    "data": {},
    "settings": {},
    "createdAt": { type: 'date', default: () => Date.now() }
  },
  
  Document: {
    "id#": "autoinc",
    "title!": "",
    "content!": "",
    "authorId!": "User",
    "createdAt": { type: 'date', default: () => Date.now() }
  },
  
  Event: {
    "id#": "autoinc",
    "type!": "",
    "message!": "",
    "timestamp": { type: 'date', default: () => Date.now() },
    "userId": "User"
  },
  
  Notification: {
    "id#": "autoinc",
    "userId!": "User",
    "message!": "",
    "type": "info",
    "read": false,
    "createdAt": { type: 'date', default: () => Date.now() }
  },
  
  Role: {
    "id#": "autoinc",
    "name!": "",
    "permissions": [],
    "createdAt": { type: 'date', default: () => Date.now() }
  },
  
  ActivityLog: {
    "id#": "autoinc",
    "userId!": "User",
    "action!": "",
    "timestamp": { type: 'date', default: () => Date.now() },
    "details": {}
  },
  
  Thread: {
    "id#": "autoinc",
    "title!": "",
    "content!": "",
    "authorId!": "User",
    "posts": [],
    "createdAt": { type: 'date', default: () => Date.now() }
  },
  
  Dashboard: {
    "id#": "autoinc",
    "userId!": "User",
    "widgets": [],
    "createdAt": { type: 'date', default: () => Date.now() }
  }
};
```

---

### ⚠️ 2. Component Definitions (Needs Fixes)

**Files**: 
- `blog2/bootstrap.js` - Bootstrap components
- `blog2/components/Home.js`
- `blog2/components/Posts.js`
- `blog2/components/About.js`

**Status**: ⚠️ Need fixing (syntax issues)
**Action**: Create proper implementations

#### Fix #1: Create Component Registry

Add to `/src/soml.js`:
```javascript
// Component registry
soml.registry = {};

// Register function
soml.register = (name, component) => {
  if (typeof component === 'function') {
    soml.registry[name] = component;
    soml.components[name] = component;
  }
  return component;
};

// Allow soml(name, fn) syntax for registration
const _somlCore = soml;
const soml = (...args) => {
  // Registration: soml('Name', fn)
  if (args.length === 2 && typeof args[0] === 'string' && typeof args[1] === 'function') {
    return soml.register(args[0], args[1]);
  }
  // Normal processing
  return _somlCore(...args);
};

// Copy over properties
Object.setPrototypeOf(soml, _somlCore);
Object.assign(soml, _somlCore);
```

#### Fix #2: Create Bootstrap Components

Create `/src/components/bootstrap.js`:
```javascript
const { soml } = require('../soml');

// Register components
soml.register('Container', (props = {}) => ({
  div: { class: 'container', ...props }
}));

soml.register('Row', (props = {}) => ({
  div: { class: 'row', ...props }
}));

soml.register('Col', ({ size, ...props } = {}) => ({
  div: {
    class: `col${size ? '-' + size : ''}`,
    ...props
  }
}));

soml.register('Button', ({ variant = 'primary', ...props } = {}) => ({
  button: {
    class: `btn btn-${variant}`,
    ...props
  }
}));

soml.register('Card', ({ title, children, footer } = {}) => ({
  div: {
    class: 'card',
    children: [
      title && { div: { class: 'card-header', content: title } },
      { div: { class: 'card-body', children } },
      footer && { div: { class: 'card-footer', children: footer } }
    ].filter(Boolean)
  }
}));

soml.register('Nav', ({ brand, links = [] } = {}) => ({
  nav: {
    class: 'navbar navbar-expand-lg navbar-light bg-light',
    children: [
      { div: { class: 'container-fluid', children: [
        brand && { a: { class: 'navbar-brand', href: '/', content: brand } },
        { div: { class: 'navbar-nav', children: links.map(link => ({
          a: { class: 'nav-link', href: link.href, content: link.text }
        })) }}
      ]}}
    ]
  }
}));

soml.register('Alert', ({ variant = 'info', children } = {}) => ({
  div: {
    class: `alert alert-${variant}`,
    role: 'alert',
    children
  }
}));

soml.register('Badge', ({ variant = 'primary', children } = {}) => ({
  span: {
    class: `badge bg-${variant}`,
    children
  }
}));

soml.register('Table', ({ headers = [], rows = [] } = {}) => ({
  table: {
    class: 'table',
    children: [
      { thead: { tr: headers.map(h => ({ th: h })) } },
      { tbody: rows.map(row => ({ tr: row.map(cell => ({ td: cell })) })) }
    ]
  }
}));

module.exports = soml.registry;
```

#### Fix #3: Create Page Components

Create `/src/components/pages.js`:
```javascript
const { soml } = require('../soml');

soml.register('Home', () => ({
  div: {
    class: 'container',
    children: [
      { h1: 'Welcome to the Blog!' },
      { p: 'This is a sample blog application built with SOML.' },
      { a: { class: 'btn btn-primary', href: '/posts', content: 'View Posts' } }
    ]
  }
}));

soml.register('Posts', ({ posts = [] } = {}) => ({
  div: {
    class: 'container',
    children: [
      { h1: 'Posts' },
      { div: { class: 'posts', children: posts.map(post => ({
        div: {
          class: 'post card mb-3',
          children: [
            { div: { class: 'card-body', children: [
              { h2: { class: 'card-title', content: post.title } },
              { p: { class: 'card-text', content: post.content } },
              { a: { 
                class: 'btn btn-link', 
                href: `/posts/${post.id}`, 
                content: 'Read More' 
              }}
            ]}}
          ]
        }
      })) }}
    ]
  }
}));

soml.register('About', () => ({
  div: {
    class: 'container',
    children: [
      { h1: 'About' },
      { p: 'This blog is built with SOML - Simple Object Markup Language' }
    ]
  }
}));

soml.register('ToDo', ({ todos = [] } = {}) => ({
  div: {
    class: 'container',
    children: [
      { h1: 'To-Do List' },
      { ul: { class: 'list-group', children: todos.map(todo => ({
        li: {
          class: 'list-group-item d-flex justify-content-between',
          children: [
            { span: todo.text },
            { button: { 
              class: 'btn btn-danger btn-sm', 
              content: 'Delete',
              onclick: `deleteTodo('${todo._id}')`
            }}
          ]
        }
      })) }},
      { script: { content: `
        function deleteTodo(id) {
          fetch('/api/delete-todo', { 
            method: 'POST', 
            body: JSON.stringify({ id }),
            headers: { 'Content-Type': 'application/json' }
          }).then(() => location.reload());
        }
      `}}
    ]
  }
}));

module.exports = soml.registry;
```

---

### ✅ 3. Route Definitions (Adaptable)

**File**: `blog2/routes.js`
**Status**: ✅ Can adapt for Express
**Action**: Convert to Express middleware

Create `/src/utils/component-router.js`:
```javascript
const { soml } = require('../soml');

// Render a registered component
const renderComponent = (componentName, props = {}, options = {}) => {
  const component = soml.registry[componentName];
  
  if (!component) {
    throw new Error(`Component '${componentName}' not found in registry`);
  }
  
  const content = component(props);
  
  // Wrap in layout if requested
  if (options.layout !== false) {
    const page = {
      html: {
        lang: 'en',
        head: {
          meta: { charset: 'UTF-8' },
          title: props.title || componentName,
          link: { 
            rel: 'stylesheet',
            href: 'https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css'
          }
        },
        body: content
      }
    };
    return '<!DOCTYPE html>' + soml.toHtml(page);
  }
  
  return soml.toHtml(content);
};

// Express middleware for component rendering
const componentRoute = (componentName, propsGetter) => {
  return async (req, res, next) => {
    try {
      const props = typeof propsGetter === 'function' 
        ? await propsGetter(req, res) 
        : propsGetter || {};
      
      const html = renderComponent(componentName, props);
      res.send(html);
    } catch (error) {
      next(error);
    }
  };
};

module.exports = { renderComponent, componentRoute };
```

Update `/src/routes/cient.js` to use components:
```javascript
const express = require('express');
const router = express.Router();
const { componentRoute } = require('../utils/component-router');
const { db } = require('../db');

// Load components
require('../components/bootstrap');
require('../components/pages');

// Use component-based routes
router.get('/', componentRoute('Home'));

router.get('/posts', componentRoute('Posts', async (req) => {
  try {
    const dbConn = await db.connect();
    const posts = await dbConn.collection('posts').find({}).limit(20).toArray();
    return { posts, title: 'Posts' };
  } catch (error) {
    return { posts: [], title: 'Posts' };
  }
}));

router.get('/about', componentRoute('About'));

router.get('/todos', componentRoute('ToDo', async (req) => {
  try {
    const dbConn = await db.connect();
    const todos = await dbConn.collection('todos').find({}).toArray();
    return { todos, title: 'To-Do List' };
  } catch (error) {
    return { todos: [], title: 'To-Do List' };
  }
}));

module.exports = router;
```

---

### ⚠️ 4. Database Abstraction (Optional)

**File**: `blog2/blog.db.js`
**Status**: ⚠️ Uses Mongoose (different from current MongoDB driver)
**Action**: Create adapter or stick with current

#### Option A: Keep Current MongoDB Driver (Recommended)

Current `/src/db.js` works fine. Just expand it:
```javascript
const { MongoClient } = require('mongodb');

const db = {
  client: null,
  
  connect: async () => {
    if (!db.client) {
      db.client = await MongoClient.connect('mongodb://localhost:27017');
    }
    return db.client.db('soml-blog');
  },
  
  collections: require('./model.js'),
  
  // Helper methods
  findOne: async (collection, query) => {
    const conn = await db.connect();
    return conn.collection(collection).findOne(query);
  },
  
  findMany: async (collection, query, options = {}) => {
    const conn = await db.connect();
    return conn.collection(collection).find(query, options).toArray();
  },
  
  create: async (collection, data) => {
    const conn = await db.connect();
    return conn.collection(collection).insertOne(data);
  },
  
  update: async (collection, query, data) => {
    const conn = await db.connect();
    return conn.collection(collection).updateOne(query, { $set: data });
  },
  
  delete: async (collection, query) => {
    const conn = await db.connect();
    return conn.collection(collection).deleteOne(query);
  }
};

module.exports = { db };
```

#### Option B: Add Mongoose Support (Extra Dependency)

Only if you really want Mongoose ORM features:
```bash
npm install mongoose
```

Create `/src/db-mongoose.js`:
```javascript
const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost/soml-blog', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

// Define schemas from model
const models = require('./model');
const schemas = {};

Object.keys(models).forEach(modelName => {
  const schemaDefinition = {};
  // Convert model format to Mongoose schema
  // ... implementation
  schemas[modelName] = mongoose.model(modelName, new mongoose.Schema(schemaDefinition));
});

module.exports = schemas;
```

---

## Integration Checklist

### Phase 1: Core Components (30 minutes)

- [ ] Add component registry to `/src/soml.js`
- [ ] Test component registration
- [ ] Create `/src/components/bootstrap.js`
- [ ] Create `/src/components/pages.js`
- [ ] Update package.json if using Bootstrap CSS

### Phase 2: Routing (20 minutes)

- [ ] Create `/src/utils/component-router.js`
- [ ] Update `/src/routes/cient.js` to use components
- [ ] Test all routes work

### Phase 3: Models (10 minutes)

- [ ] Merge blog2/Model.js into `/src/model.js`
- [ ] Convert syntax to current notation (`!` `#`)
- [ ] Add default values where needed

### Phase 4: Database (Optional, 15 minutes)

- [ ] Add helper methods to `/src/db.js`
- [ ] Or add Mongoose if preferred
- [ ] Test database operations

### Phase 5: Testing (15 minutes)

- [ ] Test component rendering
- [ ] Test all routes
- [ ] Verify Bootstrap styles load
- [ ] Test database integration

---

## Quick Start Script

```bash
#!/bin/bash
# integrate-blog2.sh

cd /home/bittnkr/soml

echo "Phase 1: Adding component system..."
# Component registry is manual edit to src/soml.js

echo "Phase 2: Creating component files..."
mkdir -p src/components src/utils

cat > src/components/bootstrap.js << 'EOF'
// See full implementation above
EOF

cat > src/components/pages.js << 'EOF'
// See full implementation above
EOF

cat > src/utils/component-router.js << 'EOF'
// See full implementation above
EOF

echo "Phase 3: Merging models..."
# Manual merge of Model.js into src/model.js

echo "Phase 4: Adding Bootstrap CSS..."
# Already done via CDN in component-router

echo "Phase 5: Testing..."
npm test
node src/server.js &
sleep 2
curl http://localhost:3000/
pkill -f "node src/server"

echo "Integration complete!"
```

---

## What NOT to Integrate

### ❌ Don't Copy These

1. **blog2/soml.js** - Incomplete stub, use current `/src/soml.js`
2. **blog2/blog.soml.js** - Refers to non-existent files
3. **blog2/server.js** - Different architecture, keep Express
4. **blog2/server0.js** - Outdated version
5. **Syntax differences** - Keep current `div-id.class` not `div:class`

### ⚠️ Fix Before Using

1. **blog2/ToDo.js** - Fix `require('./db')` to use actual db
2. **blog2/bootstrap.js** - Fix syntax and dependencies
3. **blog2/components/*.js** - Add `soml()` calls properly

---

## Summary

**Can Integrate Immediately** ✅:
- blog2/Model.js → src/model.js (expand entities)
- Component concepts → New component system

**Needs Fixing First** ⚠️:
- Bootstrap components → Rewrite properly
- Page components → Adapt to current syntax
- Routes → Convert to Express format

**Don't Use** ❌:
- blog2/soml.js (incomplete)
- blog2/server*.js (different architecture)
- Circular dependencies

**Estimated Integration Time**: 1-2 hours for full component system

The biggest value is the **component registry pattern** and **extended entity models**. Everything else needs significant rework to match the current working implementation.

