# Missing Features from blog2

## Overview

The `blog2` folder references several features that aren't implemented in the current working codebase. This document tracks what's missing and provides implementation guidance.

## 1. Component Registry System ❌

### What's Missing
```javascript
// blog2 expects this to work:
soml('Header', ({ title }) => ({ h1: title }));
const HeaderComponent = soml.registry['Header'];
```

### Current Status
The current implementation has `soml.components = {}` but no registration mechanism.

### Implementation

Add to `/src/soml.js`:
```javascript
// Component registry
soml.registry = {};

// Register a component
soml.register = (name, component) => {
  if (typeof component === 'function') {
    soml.registry[name] = component;
    soml.components[name] = component;
  }
  return component;
};

// Shorthand: soml(name, fn) registers component
const originalSoml = soml;
const soml = (...args) => {
  // If called with (string, function), register component
  if (args.length === 2 && typeof args[0] === 'string' && typeof args[1] === 'function') {
    return soml.register(args[0], args[1]);
  }
  // Otherwise, process normally
  return originalSoml(...args);
};
```

**Usage**:
```javascript
// Register
soml('Header', ({ title }) => ({ h1: title }));

// Use
const page = { div: { children: [soml.registry.Header({ title: 'Hello' })] } };
```

---

## 2. Bootstrap Component Library ❌

### What's Missing
Pre-built Bootstrap components like Button, Container, Row, Col, Nav, etc.

### Implementation

Create `/src/components/bootstrap.js`:
```javascript
const { soml } = require('../soml');

const Container = (props) => ({
  div: {
    class: 'container',
    ...props
  }
});

const Row = (props) => ({
  div: {
    class: 'row',
    ...props
  }
});

const Col = ({ size, ...props }) => ({
  div: {
    class: `col${size ? '-' + size : ''}`,
    ...props
  }
});

const Button = ({ variant = 'primary', size, outline, ...props }) => ({
  button: {
    class: [
      'btn',
      outline ? `btn-outline-${variant}` : `btn-${variant}`,
      size && `btn-${size}`
    ].filter(Boolean).join(' '),
    ...props
  }
});

const Card = ({ title, children, footer }) => ({
  div: {
    class: 'card',
    children: [
      title && { div: { class: 'card-header', content: title } },
      { div: { class: 'card-body', children } },
      footer && { div: { class: 'card-footer', children: footer } }
    ].filter(Boolean)
  }
});

const Nav = ({ brand, links }) => ({
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
});

const Alert = ({ variant = 'info', dismissible, children }) => ({
  div: {
    class: `alert alert-${variant}${dismissible ? ' alert-dismissible fade show' : ''}`,
    role: 'alert',
    children: [
      children,
      dismissible && { button: { 
        type: 'button', 
        class: 'btn-close', 
        'data-bs-dismiss': 'alert' 
      }}
    ].filter(Boolean)
  }
});

const Form = ({ children, ...props }) => ({
  form: {
    class: 'needs-validation',
    children,
    ...props
  }
});

const FormGroup = ({ label, input, help }) => ({
  div: {
    class: 'mb-3',
    children: [
      label && { label: { class: 'form-label', content: label } },
      input,
      help && { div: { class: 'form-text', content: help } }
    ].filter(Boolean)
  }
});

const Input = ({ type = 'text', placeholder, ...props }) => ({
  input: {
    type,
    class: 'form-control',
    placeholder,
    ...props
  }
});

const Textarea = ({ rows = 3, ...props }) => ({
  textarea: {
    class: 'form-control',
    rows,
    ...props
  }
});

module.exports = {
  Container,
  Row,
  Col,
  Button,
  Card,
  Nav,
  Alert,
  Form,
  FormGroup,
  Input,
  Textarea
};
```

**Usage**:
```javascript
const { Container, Row, Col, Button, Card } = require('./components/bootstrap');

const page = Container({
  children: [
    Row({
      children: [
        Col({ size: 'md-6', children: [
          Card({
            title: 'Welcome',
            children: [
              { p: 'This is a card' },
              Button({ variant: 'primary', content: 'Click Me' })
            ]
          })
        ]})
      ]
    })
  ]
});
```

---

## 3. Async Component Support ❌

### What's Missing
```javascript
// blog2/ToDo.js expects this to work:
soml('ToDo', async () => {
  const todos = await db.collection('todos').find().toArray();
  return { ul: todos.map(t => ({ li: t.text })) };
});
```

### Implementation

Add to `/src/soml.js`:
```javascript
// Handle async functions in plugin
soml.plugin('function', {
  test: (input) => typeof input === 'function',
  from: async (input) => {
    const result = input();
    // If result is a Promise, await it
    const resolved = result instanceof Promise ? await result : result;
    const processed = soml(resolved);
    return Array.isArray(processed) && processed.length === 1 ? processed[0] : processed;
  },
  to: (somlObject) => () => somlObject
});
```

**Usage**:
```javascript
const AsyncComponent = async () => {
  const data = await fetchData();
  return { div: { content: data } };
};

// In an async context
const rendered = await soml(AsyncComponent);
```

---

## 4. Extended Entity Models ⚠️

### What's Missing
blog2 has 13+ entity types, current has only 4.

### Recommended Additions

Extend `/src/model.js`:
```javascript
module.exports = {
  // Existing
  User: { "id#": "autoinc", "name!": "", "email!#": "" },
  Post: { "id!#": "autoinc", "authorId!": 'User', "title!": "", "content!": "" },
  Task: { "id#": "autoinc", "userId!": 'User', "description!": "", "completed": false },
  State: { "id#": "autoinc", "userId!": 'User', "state": {} },
  
  // Add from blog2
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
    "slug!#": "",
    "description": ""
  },
  
  Tag: {
    "id#": "autoinc",
    "name!#": "",
    "slug!#": ""
  },
  
  Image: {
    "id#": "autoinc",
    "url!": "",
    "altText": "",
    "uploadedBy": "User",
    "uploadedAt": { type: 'date', default: () => Date.now() }
  },
  
  Notification: {
    "id#": "autoinc",
    "userId!": "User",
    "message!": "",
    "type": "info", // info, warning, error, success
    "read": false,
    "createdAt": { type: 'date', default: () => Date.now() }
  }
};
```

---

## 5. Object-based Router ⚠️

### What blog2 Has
```javascript
// blog2/routes.js
module.exports = {
  '/': (req, res) => renderPage('Home', req, res),
  '/posts': async (req, res) => { ... },
  '/about': (req, res) => renderPage('About', req, res)
};

// blog2/server.js
if (routes[pathname]) {
  routes[pathname](req, res);
}
```

### Current Implementation
Uses Express router pattern. The object-based approach is simpler but less powerful.

### Recommendation
**Keep Express** for production, but add helper for simple cases:

Create `/src/utils/simple-router.js`:
```javascript
const routeMap = (routes) => {
  return (req, res, next) => {
    const handler = routes[req.path];
    if (handler) {
      return handler(req, res, next);
    }
    next();
  };
};

module.exports = { routeMap };
```

**Usage**:
```javascript
const { routeMap } = require('./utils/simple-router');

const routes = {
  '/': (req, res) => res.send(renderPage('Home')),
  '/posts': async (req, res) => {
    const posts = await getPosts();
    res.send(renderPage('Posts', { posts }));
  }
};

app.use(routeMap(routes));
```

---

## 6. Syntax Standardization ⚠️

### Inconsistencies

**Tag notation**:
- Current: `div-42.class1.class2` ✅
- blog2: `ul:navbar-nav` ❌

**Content property**:
- Current: `content` ✅
- blog2: `text` ❌

### Recommendation
**Keep current syntax**. It's more standard and works well.

If we want to support both:
```javascript
// Normalize in HTML rendering
for (const [key, val] of Object.entries(props)) {
  if (key === 'content' || key === 'text') {
    childrenHtml += typeof val === 'object' ? soml.toHtml(val) : String(val);
  }
  // ...
}
```

---

## 7. Template System ⚠️

### What's Missing
blog2 suggests a page template system:
```javascript
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
```

### Implementation

Add to `/src/routes/cient.js`:
```javascript
const { soml } = require('../soml');

const renderPage = (component, props = {}, layout = true) => {
  const content = typeof component === 'function' ? component(props) : component;
  
  if (!layout) {
    return '<!DOCTYPE html>' + soml.toHtml(content);
  }
  
  const page = {
    html: {
      lang: 'en',
      head: {
        meta: { charset: 'UTF-8' },
        title: props.title || 'SOML Blog',
        style: `/* CSS here */`
      },
      body: {
        nav: [/* navigation */],
        children: content
      }
    }
  };
  
  return '<!DOCTYPE html>' + soml.toHtml(page);
};

module.exports = { renderPage };
```

---

## Priority Implementation Order

### Phase 1: Essential (Do First)
1. ✅ Component Registry System
2. ✅ Bootstrap Components Library

### Phase 2: Quality of Life
3. ✅ Async Component Support
4. ✅ Template/Layout System

### Phase 3: Enhancement
5. ⚠️ Extended Entity Models (as needed)
6. ⚠️ Simple Router Helper (optional)

### Phase 4: Polish
7. ⚠️ Syntax normalization (low priority)

---

## Quick Start: Add Component Registry

Minimal implementation to get blog2-style components working:

```javascript
// Add to /src/soml.js at the end

// Component registry
soml.registry = {};

// Register components by name
soml.register = (name, fn) => {
  soml.registry[name] = fn;
  soml.components[name] = fn;
  return fn;
};

// Enable soml(name, fn) syntax
const _soml = soml;
module.exports = { 
  soml: Object.assign(
    (...args) => {
      if (args.length === 2 && typeof args[0] === 'string' && typeof args[1] === 'function') {
        return soml.register(args[0], args[1]);
      }
      return _soml(...args);
    },
    _soml
  ),
  parseTag 
};
```

Now you can use blog2 patterns:
```javascript
soml('Header', ({ title }) => ({ h1: title }));
soml('Footer', () => ({ p: '© 2024' }));

const page = {
  div: [
    soml.registry.Header({ title: 'Welcome' }),
    { p: 'Content here' },
    soml.registry.Footer()
  ]
};
```

---

## Testing Missing Features

Create `/src/soml.components.test.js`:
```javascript
const { soml } = require('./soml');

// Test component registration
soml.register('Button', ({ label, variant = 'primary' }) => ({
  button: { class: `btn btn-${variant}`, content: label }
}));

const button = soml.registry.Button({ label: 'Click Me', variant: 'success' });
console.log(soml.toHtml(button));
// Expected: <button class="btn btn-success">Click Me</button>

// Test shorthand registration
soml('Card', ({ title, content }) => ({
  div: {
    class: 'card',
    children: [
      { div: { class: 'card-header', content: title } },
      { div: { class: 'card-body', content } }
    ]
  }
}));

const card = soml.registry.Card({ title: 'Test', content: 'Hello' });
console.log(soml.toHtml(card));
```

Run: `node src/soml.components.test.js`

---

## Summary

**What blog2 shows us**:
- ✅ Component registration is useful
- ✅ Bootstrap integration makes sense
- ✅ Async components are needed
- ⚠️ Object routing is too simple
- ⚠️ Extended models are nice-to-have
- ❌ Syntax changes aren't necessary

**What to do**:
1. Implement component registry (30 min)
2. Create Bootstrap library (1-2 hours)
3. Add async support (30 min)
4. Expand models as needed (ongoing)

The current implementation is solid. blog2 shows good extensions to add, not fundamental changes needed.

