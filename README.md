# SOML + CentralStation

**Build modern web applications using pure JavaScript objects. Never write HTML strings.**

## What is SOML?

**SOML (Simple Object Markup Language)** is a way to describe UI structure using JavaScript objects instead of HTML strings. It supports two syntaxes that work together:

### Canonical Syntax (Foundation)
```javascript
{
  div: {
    id: 'container',
    class: ['card', 'shadow'],
    children: [
      { h5: { text: 'Title' } }
    ]
  }
}
```

### Concise Syntax (Common Pattern)
```javascript
{
  'container card shadow': {
    'h5': 'Title'
  }
}
```

**Both compile to:** `<div id="container" class="card shadow"><h5>Title</h5></div>`

## What is CentralStation?

**CentralStation** unifies HTTP and WebSocket into one consistent API:

```javascript
// HTTP Routes
cs.route('/blog', 'GET', (req, res) => {...});

// WebSocket Events (same API pattern!)
cs.on('comment:create', (data, client) => {...});
cs.broadcast('comment:created', comment);
```

## Quick Start

```bash
# Install
npm install

# Run tests
npm test

# Run blog2 demo
node blog2/server.js
# Visit http://localhost:3000/blog2
```

## Documentation

📄 **[doc/SOML.md](doc/SOML.md)** - Complete SOML documentation (single source of truth)

📄 **[blog2/README.md](blog2/README.md)** - Complete real-time blog application

## Example: Real-Time Blog

### Server (pages/HomePage.soml.js)
```javascript
const HomePage = ({ posts }) => ({
  head: {
    title: "My Blog",
    link: { rel: 'stylesheet', href: '/app.css' }
  },
  
  body: {
    'container mt-5': {
      'h1 text-center mb-4': 'My Blog',
      
      'posts-grid row': posts.map(post => ({
        'div col-md-6 mb-4': {
          'div card shadow': {
            'div card-body': {
              'h5 card-title': post.title,
              'p card-text': post.excerpt
            }
          }
        }
      }))
    },
    
    script() {
      const cs = new CentralStation();
      
      // Real-time updates using SOML!
      cs.on('post:created', (post) => {
        const card = soml({
          'div col-md-6 mb-4 fade-in': {
            'div card shadow': {
              'div card-body': {
                'h5 card-title': post.title,
                'p card-text': post.excerpt
              }
            }
          }
        });
        get('#posts-grid').prepend(card);
      });
    }
  }
});
```

### Server Route (server.js)
```javascript
const { soml } = require('./src/soml');
const HomePage = require('./pages/HomePage.soml');

cs.route('/blog', 'GET', (req, res) => {
  const html = soml.toHtml(HomePage({ posts }));
  res.send(html);
});

cs.on('post:create', (data, client) => {
  const post = store.addPost(data);
  cs.broadcast('post:created', post);
});
```

## Key Features

✅ **Dual Syntax** - Verbose for control, concise for brevity  
✅ **Pure SOML** - Never use HTML strings  
✅ **Real-Time** - WebSocket built-in with CentralStation  
✅ **Code Reduction** - 50-85% less code  
✅ **Composable** - Functions return SOML objects  
✅ **Type-Safe** - JavaScript objects, not strings  
✅ **Universal** - Works with any CSS framework  

## File Structure

```
src/
├── soml.js              # Core SOML parser + HTML renderer
├── soml-client.js       # Client-side SOML→DOM conversion
└── soml.test.js         # Test suite (6/6 passing)

blog2/                   # Complete real-time blog demo
├── server.js            # CentralStation server
├── store.js             # In-memory data store
├── pages/               # Page components (concise SOML)
└── README.md            # Complete documentation

doc/
└── SOML.md              # Complete SOML guide (single source of truth)
```

## Philosophy

**In a SOML application, you should never use HTML strings. Always think in SOML terms.**

### ❌ Wrong
```javascript
element.innerHTML = '<div class="card">...</div>';
```

### ✅ Right
```javascript
const card = soml({ 'div card': {...} });
element.appendChild(card);
```

## Why SOML?

1. **Consistency** - One way to describe UI everywhere
2. **Composability** - Functions return SOML, easily nested
3. **Type Safety** - Objects can be validated and transformed
4. **Tooling** - Better IDE support than HTML strings
5. **Brevity** - Concise syntax reduces code by 50-85%
6. **Real-Time** - Perfect match with CentralStation's WebSocket API

## Examples

### Simple Component
```javascript
const Alert = (message, type = 'success') => ({
  [`div alert alert-${type}`]: message
});

// Use it
const html = soml.toHtml(Alert('Success!', 'success'));
// → <div class="alert alert-success">Success!</div>
```

### Real-Time Component
```javascript
// Client-side
cs.on('notification', (data) => {
  const notification = soml({
    'div notification fade-in': {
      'strong': data.title,
      'p': data.message
    }
  });
  document.body.appendChild(notification);
});
```

### Full Page
```javascript
const Page = ({ user, posts }) => ({
  head: { title: "Dashboard" },
  body: {
    'container': {
      'h1': `Welcome, ${user.name}`,
      'div grid': posts.map(p => ({
        'div card': {
          'h3': p.title,
          'p': p.content
        }
      }))
    }
  }
});
```

## Tests

```bash
npm test
# → 6/6 tests passing ✅
```

## Demo

```bash
# Start blog2
node blog2/server.js

# Open 3 browser tabs
open http://localhost:3000/blog2

# Post a comment in one tab
# Watch it appear in all tabs instantly!
```

## Learn More

- **[doc/SOML.md](doc/SOML.md)** - Complete SOML documentation
- **[blog2/README.md](blog2/README.md)** - Real-time blog guide
- **[doc/CENTRALSTATION.md](doc/CENTRALSTATION.md)** - CentralStation guide

## License

ISC

---

**SOML + CentralStation** - Building the web, the right way. 🚂✨
