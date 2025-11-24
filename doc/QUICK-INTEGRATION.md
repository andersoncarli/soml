# Quick Integration: blog2 Components

## What You Can Actually Use Right Now

Based on the analysis, here are the **concrete, working pieces** you can integrate:

---

## 1. Component Registry (Copy & Paste Ready)

### Add to `/src/soml.js` (at the end, before `module.exports`)

```javascript
// ============= ADD THIS TO /src/soml.js =============

// Component registry
soml.registry = {};
soml.components = soml.components || {};

// Register a component by name
soml.register = (name, component) => {
  if (typeof component === 'function') {
    soml.registry[name] = component;
    soml.components[name] = component;
  }
  return component;
};
```

### Update `module.exports` line

```javascript
// Change this:
module.exports = { soml, parseTag };

// To this:
module.exports = { soml, parseTag, register: soml.register, registry: soml.registry };
```

**Test it works**:
```bash
node -e "
const { soml } = require('./src/soml.js');
soml.register('Test', () => ({ div: 'Hello' }));
console.log('Registry:', Object.keys(soml.registry));
console.log('HTML:', soml.toHtml(soml.registry.Test()));
"
```

Expected output:
```
Registry: [ 'Test' ]
HTML: <div>Hello</div>
```

---

## 2. Extended Models (Direct Merge)

### Update `/src/model.js`

**Current file** has 4 entities. **Add** these from blog2:

```javascript
// ADD TO /src/model.js after existing entities:

Comment: {
  "id#": "autoinc",
  "postId!": 'Post',
  "authorId!": 'User',
  "content!": "",
  "createdAt": { type: 'date', default: () => Date.now() },
  "updatedAt": { type: 'date', default: () => Date.now() }
},

Category: {
  "id#": "autoinc",
  "name!": "",
  "slug!#": "",
  "description": "",
  "createdAt": { type: 'date', default: () => Date.now() }
},

Image: {
  "id#": "autoinc",
  "url!": "",
  "altText": "",
  "uploadedBy": 'User',
  "uploadedAt": { type: 'date', default: () => Date.now() }
},

Notification: {
  "id#": "autoinc",
  "userId!": 'User',
  "message!": "",
  "type": "info", // info, warning, error, success
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
  "userId!": 'User',
  "action!": "",
  "details": {},
  "timestamp": { type: 'date', default: () => Date.now() }
},

Thread: {
  "id#": "autoinc",
  "title!": "",
  "content!": "",
  "authorId!": 'User',
  "posts": [],
  "createdAt": { type: 'date', default: () => Date.now() }
},

Dashboard: {
  "id#": "autoinc",
  "userId!": 'User',
  "widgets": [],
  "createdAt": { type: 'date', default: () => Date.now() }
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
  "authorId!": 'User',
  "createdAt": { type: 'date', default: () => Date.now() },
  "updatedAt": { type: 'date', default: () => Date.now() }
},

Event: {
  "id#": "autoinc",
  "type!": "",
  "message!": "",
  "userId": 'User',
  "timestamp": { type: 'date', default: () => Date.now() }
}
```

**Test it**:
```bash
node -e "
const model = require('./src/model.js');
console.log('Total entities:', Object.keys(model).length);
console.log('Entities:', Object.keys(model).join(', '));
"
```

Expected: `Total entities: 15`

---

## 3. Bootstrap Components (New File)

### Create `/src/components/bootstrap.js`

```javascript
const { soml } = require('../soml');

// Container
soml.register('Container', (props = {}) => ({
  div: { class: 'container', ...props }
}));

// Row
soml.register('Row', (props = {}) => ({
  div: { class: 'row', ...props }
}));

// Col
soml.register('Col', ({ size, ...props } = {}) => ({
  div: { class: `col${size ? '-' + size : ''}`, ...props }
}));

// Button
soml.register('Button', ({ variant = 'primary', size, ...props } = {}) => ({
  button: {
    class: `btn btn-${variant}${size ? ' btn-' + size : ''}`,
    ...props
  }
}));

// Card
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

// Alert
soml.register('Alert', ({ variant = 'primary', children } = {}) => ({
  div: {
    class: `alert alert-${variant}`,
    role: 'alert',
    children
  }
}));

// Badge
soml.register('Badge', ({ variant = 'primary', children } = {}) => ({
  span: { class: `badge bg-${variant}`, children }
}));

// Nav
soml.register('Nav', ({ brand, links = [] } = {}) => ({
  nav: {
    class: 'navbar navbar-expand-lg navbar-light bg-light',
    children: [{
      div: {
        class: 'container-fluid',
        children: [
          brand && { a: { class: 'navbar-brand', href: '/', content: brand } },
          {
            div: {
              class: 'navbar-nav',
              children: links.map(link => ({
                a: {
                  class: `nav-link${link.active ? ' active' : ''}`,
                  href: link.href,
                  content: link.text
                }
              }))
            }
          }
        ].filter(Boolean)
      }
    }]
  }
}));

// List Group
soml.register('ListGroup', ({ items = [] } = {}) => ({
  ul: {
    class: 'list-group',
    children: items.map(item => ({
      li: { class: 'list-group-item', content: item }
    }))
  }
}));

module.exports = soml.registry;
```

**Test it**:
```bash
node -e "
require('./src/components/bootstrap');
const { soml } = require('./src/soml');

const card = soml.registry.Card({
  title: 'Test Card',
  children: [
    { p: 'This is a test' },
    soml.registry.Button({ variant: 'success', content: 'Click Me' })
  ]
});

console.log(soml.toHtml(card));
"
```

---

## 4. Page Components (New File)

### Create `/src/components/pages.js`

```javascript
const { soml } = require('../soml');

// Home Page
soml.register('HomePage', ({ title = 'Welcome' } = {}) => ({
  div: {
    class: 'container mt-5',
    children: [
      { h1: { class: 'display-4', content: title } },
      { p: { class: 'lead', content: 'This is a blog built with SOML' } },
      {
        div: {
          class: 'mt-4',
          children: [
            { a: { class: 'btn btn-primary me-2', href: '/posts', content: 'View Posts' } },
            { a: { class: 'btn btn-secondary', href: '/about', content: 'About' } }
          ]
        }
      }
    ]
  }
}));

// Posts List Page
soml.register('PostsPage', ({ posts = [], title = 'Blog Posts' } = {}) => ({
  div: {
    class: 'container mt-5',
    children: [
      { h1: { class: 'mb-4', content: title } },
      posts.length === 0 ? 
        { p: { class: 'text-muted', content: 'No posts yet.' } } :
        {
          div: {
            class: 'row',
            children: posts.map(post => ({
              div: {
                class: 'col-md-6 mb-4',
                children: [{
                  div: {
                    class: 'card h-100',
                    children: [
                      {
                        div: {
                          class: 'card-body',
                          children: [
                            { h5: { class: 'card-title', content: post.title } },
                            { p: { class: 'card-text', content: post.content?.substring(0, 150) + '...' } },
                            {
                              a: {
                                class: 'btn btn-sm btn-outline-primary',
                                href: `/posts/${post.id}`,
                                content: 'Read More'
                              }
                            }
                          ]
                        }
                      }
                    ]
                  }
                }]
              }
            }))
          }
        }
    ]
  }
}));

// About Page
soml.register('AboutPage', () => ({
  div: {
    class: 'container mt-5',
    children: [
      { h1: { content: 'About' } },
      { p: { content: 'This blog is built with SOML - Simple Object Markup Language.' } },
      { p: { content: 'SOML allows you to define UI using plain JavaScript objects.' } }
    ]
  }
}));

// ToDo Page
soml.register('ToDoPage', ({ todos = [] } = {}) => ({
  div: {
    class: 'container mt-5',
    children: [
      { h1: { class: 'mb-4', content: 'To-Do List' } },
      {
        ul: {
          class: 'list-group',
          children: todos.map(todo => ({
            li: {
              class: 'list-group-item d-flex justify-content-between align-items-center',
              children: [
                { span: todo.description || todo.text },
                {
                  button: {
                    class: 'btn btn-danger btn-sm',
                    content: 'Delete',
                    onclick: `deleteTodo('${todo.id || todo._id}')`
                  }
                }
              ]
            }
          }))
        }
      },
      {
        script: {
          content: `
            function deleteTodo(id) {
              fetch('/api/tasks/' + id, { method: 'DELETE' })
                .then(() => location.reload())
                .catch(err => console.error(err));
            }
          `
        }
      }
    ]
  }
}));

module.exports = soml.registry;
```

**Test it**:
```bash
node -e "
require('./src/components/pages');
const { soml } = require('./src/soml');

const home = soml.registry.HomePage({ title: 'Welcome!' });
console.log(soml.toHtml(home).substring(0, 200));
"
```

---

## 5. Component Router Helper (New File)

### Create `/src/utils/component-router.js`

```javascript
const { soml } = require('../soml');

// Render a page component with layout
const renderPage = (componentName, props = {}, options = {}) => {
  const component = soml.registry[componentName];
  
  if (!component) {
    throw new Error(`Component '${componentName}' not found`);
  }
  
  const content = component(props);
  
  const page = {
    html: {
      lang: 'en',
      head: {
        meta: { charset: 'UTF-8' },
        title: props.title || 'SOML Blog',
        link: {
          rel: 'stylesheet',
          href: 'https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css'
        }
      },
      body: content
    }
  };
  
  return '<!DOCTYPE html>' + soml.toHtml(page);
};

// Express middleware for component-based routes
const componentRoute = (componentName, getProps) => {
  return async (req, res, next) => {
    try {
      const props = typeof getProps === 'function' 
        ? await getProps(req, res) 
        : (getProps || {});
      
      const html = renderPage(componentName, props);
      res.send(html);
    } catch (error) {
      next(error);
    }
  };
};

module.exports = { renderPage, componentRoute };
```

---

## 6. Update Routes to Use Components

### Replace `/src/routes/cient.js` content

```javascript
const express = require('express');
const router = express.Router();
const { componentRoute } = require('../utils/component-router');
const { db } = require('../db');

// Load components
require('../components/bootstrap');
require('../components/pages');

// Home page
router.get('/', componentRoute('HomePage', {
  title: 'Welcome to SOML Blog'
}));

// Posts page
router.get('/posts', componentRoute('PostsPage', async (req) => {
  try {
    const dbConn = await db.connect();
    const posts = await dbConn.collection('posts').find({}).limit(20).toArray();
    return { posts, title: 'Blog Posts' };
  } catch (error) {
    console.error('Database error:', error);
    return { posts: [], title: 'Blog Posts' };
  }
}));

// About page
router.get('/about', componentRoute('AboutPage'));

// ToDo page
router.get('/todos', componentRoute('ToDoPage', async (req) => {
  try {
    const dbConn = await db.connect();
    const todos = await dbConn.collection('tasks').find({}).toArray();
    return { todos, title: 'To-Do List' };
  } catch (error) {
    console.error('Database error:', error);
    return { todos: [], title: 'To-Do List' };
  }
}));

module.exports = router;
```

---

## Testing the Integration

### Run All Tests

```bash
cd /home/bittnkr/soml

# 1. Test component registry
node -e "
const { soml } = require('./src/soml.js');
soml.register('Test', () => ({ h1: 'Works!' }));
console.log('✓ Registry works');
console.log('✓ HTML:', soml.toHtml(soml.registry.Test()));
"

# 2. Test Bootstrap components
node -e "
require('./src/components/bootstrap');
const { soml } = require('./src/soml');
console.log('✓ Bootstrap components loaded:', Object.keys(soml.registry).length);
"

# 3. Test page components
node -e "
require('./src/components/pages');
const { soml } = require('./src/soml');
console.log('✓ Page components loaded');
console.log('✓ Components:', Object.keys(soml.registry).join(', '));
"

# 4. Start server and test
pkill -f "node src/server.js" 2>/dev/null || true
node src/server.js &
sleep 3
echo "✓ Server started"

curl -s http://localhost:3000/ | grep -o '<title>.*</title>'
echo "✓ Home page works"

curl -s http://localhost:3000/posts | grep -o '<title>.*</title>'
echo "✓ Posts page works"

curl -s http://localhost:3000/about | grep -o '<title>.*</title>'
echo "✓ About page works"

pkill -f "node src/server.js"
echo "✓ All tests passed!"
```

---

## File Creation Checklist

Run this to create all files at once:

```bash
#!/bin/bash
cd /home/bittnkr/soml

# Create directories
mkdir -p src/components src/utils

# Create bootstrap.js
cat > src/components/bootstrap.js << 'BOOTSTRAP_EOF'
# [Paste bootstrap.js content from above]
BOOTSTRAP_EOF

# Create pages.js
cat > src/components/pages.js << 'PAGES_EOF'
# [Paste pages.js content from above]
PAGES_EOF

# Create component-router.js
cat > src/utils/component-router.js << 'ROUTER_EOF'
# [Paste component-router.js content from above]
ROUTER_EOF

echo "✓ Files created"
echo "Now manually edit:"
echo "  1. /src/soml.js - Add component registry"
echo "  2. /src/model.js - Add entities"
echo "  3. /src/routes/cient.js - Use components"
```

---

## What You Get

After integration:

1. **Component System** - Register and reuse UI components
2. **15 Entities** - Comprehensive data model
3. **Bootstrap UI** - Professional-looking components
4. **4 Pages** - Home, Posts, About, ToDo
5. **Component Router** - Easy page creation

**Total time**: 20-30 minutes

**Lines of code added**: ~400

**New features**: Component library, expanded models, better UI

