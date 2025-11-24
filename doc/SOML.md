# SOML Documentation - The Definitive Guide

**SOML (Simple Object Markup Language)** - Build web applications using pure JavaScript objects, never write HTML strings.

## Core Principle

**Never use HTML strings in a SOML application. Always think in SOML terms.**

HTML is an output format, not an input. SOML is your source of truth.

## The Two Syntaxes

SOML supports two syntaxes that work together seamlessly:

### 1. Canonical Syntax (Foundation)

The full, explicit syntax that supports all SOML features:

```javascript
{
  div: {
    id: 'container',
    class: ['card', 'shadow'],
    'data-post-id': '123',
    children: [
      { h5: { class: 'card-title', text: 'Title' } },
      { p: { class: 'card-text', text: 'Content' } }
    ]
  }
}
```

**Use when:**
- Complex attributes needed
- Event handlers
- Dynamic data binding
- Maximum clarity required

### 2. Concise Syntax (Common Pattern)

Ultra-brief syntax with space-separated classes:

```javascript
{
  'container-123 card shadow': {
    'data-post-id': '123',
    'h5 card-title': 'Title',
    'p card-text': 'Content'
  }
}
```

**Use when:**
- Utility classes (Bootstrap/Tailwind)
- Quick layouts
- Simple structures
- Maximum brevity

**Both are valid and can be freely mixed!**

## Syntax Rules

### Tag Expressions

**Format:** `'tagname-id class1 class2 class3'`

#### Examples:

```javascript
// Tag with classes
'h5 card-title text-primary': 'Hello'
// → <h5 class="card-title text-primary">Hello</h5>

// Tag with ID and classes
'button-submit btn btn-primary': 'Click'
// → <button id="submit" class="btn btn-primary">Click</button>

// Default to div if no tag
'container-main shadow-lg': {...}
// → <div id="container" class="main shadow-lg">...</div>

// ID with dashes becomes classes
'hero-section-dark': {...}
// → <div id="hero" class="section dark">...</div>
```

#### Parsing Rules:

1. **First word** = tag name (or first part before dash)
2. **After dash** = ID (if alphanum) or class (if multiple dashes)
3. **Space-separated** = classes
4. **No tag** = defaults to `div`

### Attributes

```javascript
// Simple attributes
{ id: 'myid', name: 'username', type: 'email' }

// Data attributes
{ 'data-post-id': '123', 'data-index': 5 }

// Classes (array or string)
{ class: ['btn', 'btn-primary'] }
{ class: 'btn btn-primary' }

// Style (object or string)
{ style: { color: 'red', fontSize: '16px' } }
{ style: 'color: red; font-size: 16px' }

// Event handlers
{ onclick: () => alert('clicked') }
{ onSubmit: handleSubmit }
```

### Content

```javascript
// Text content
{ h1: 'Hello World' }
{ p: { text: 'Content' } }
{ div: { content: 'Also works' } }

// Children (array or object)
{ div: { children: [
  { h1: 'Title' },
  { p: 'Content' }
] }}

// Nested objects (auto-converted to children)
{
  'div card': {
    'div card-header': 'Header',
    'div card-body': 'Body'
  }
}
```

## Server-Side Usage

### Page Components

```javascript
// pages/BlogPage.soml.js
const BlogPage = ({ posts, user }) => ({
  head: {
    title: "My Blog",
    meta: [
      { charset: 'UTF-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1.0' }
    ],
    link: { rel: 'stylesheet', href: '/styles/app.css' }
  },
  
  body: {
    // Concise syntax for layout
    'container mt-5': {
      'header mb-4': {
        'h1 display-4': 'My Blog',
        'p lead text-muted': `Welcome, ${user.name}`
      },
      
      // Posts grid
      'posts-grid row': posts.map(post => ({
        'div col-md-6 col-lg-4 mb-4': {
          'data-post-id': post.id,
          'div card h-100 shadow-sm': {
            'div card-body': {
              'h5 card-title': post.title,
              'p card-text text-muted': post.excerpt,
              'small text-muted': `By ${post.author}`
            }
          }
        }
      }))
    },
    
    // Scripts
    script: [
      { src: '/centralstation.js' },
      { src: '/soml-client.js' }
    ],
    
    // Client-side code (inline function)
    script() {
      const cs = new CentralStation();
      
      // Real-time updates using SOML!
      cs.on('post:created', (post) => {
        const card = soml({
          'div col-md-6 col-lg-4 mb-4 fade-in': {
            'data-post-id': post.id,
            'div card h-100 shadow-sm': {
              'div card-body': {
                'h5 card-title': post.title,
                'p card-text text-muted': post.excerpt,
                'small text-muted': `By ${post.author}`
              }
            }
          }
        });
        
        get('#posts-grid').prepend(card);
      });
    }
  }
});

module.exports = BlogPage;
```

### Rendering

```javascript
// server.js
const { soml } = require('./src/soml');
const BlogPage = require('./pages/BlogPage.soml');

cs.route('/blog', 'GET', (req, res) => {
  const posts = store.getPosts();
  const user = req.user;
  
  // SOML to HTML (only at final render)
  const html = soml.toHtml(BlogPage({ posts, user }));
  
  res.send(html);
});
```

## Client-Side Usage

### Functions (soml-client.js)

#### soml(obj) - Convert SOML to DOM

```javascript
const element = soml({
  'div alert alert-success': 'Operation successful!'
});

document.body.appendChild(element);
```

#### create(tagExpr, content) - Quick Creation

```javascript
const badge = create('span-count badge bg-primary', '42');
container.appendChild(badge);
```

### Real-Time with CentralStation

```javascript
// Client-side script
const cs = new CentralStation();

// Receive real-time updates
cs.on('comment:created', (comment) => {
  // Create using SOML (never HTML!)
  const commentEl = soml({
    'div comment-item border-bottom pb-3 mb-3 fade-in': {
      'div d-flex justify-content-between mb-2': {
        'strong': comment.author,
        'small text-muted': new Date(comment.createdAt).toLocaleString()
      },
      'p mb-2': comment.content,
      'button-like btn btn-sm btn-outline-primary': {
        onclick: () => cs.emit('comment:like', { id: comment.id }),
        text: `👍 ${comment.likes}`
      }
    }
  });
  
  get('#comments').prepend(commentEl);
});

// Send events
function postComment() {
  const author = get('#author').value;
  const content = get('#content').value;
  
  cs.emit('comment:create', { author, content });
  
  // Clear form
  get('#author').value = '';
  get('#content').value = '';
}
```

## Best Practices

### ✅ DO

1. **Use SOML everywhere**
   ```javascript
   const card = soml({ 'div card': { h5: 'Title' } });
   ```

2. **Use concise syntax for layouts**
   ```javascript
   'container mt-5': {
     'row': [...]
   }
   ```

3. **Use canonical syntax for complex attributes**
   ```javascript
   form: {
     method: 'post',
     action: '/submit',
     onSubmit: handleSubmit
   }
   ```

4. **Mix both syntaxes as needed**
   ```javascript
   {
     'div card shadow': {
       'div card-body': {
         // Canonical for complex case
         form: {
           method: 'post',
           onSubmit: handleSubmit,
           'div form-group': {...}
         }
       }
     }
   }
   ```

5. **Keep styles in CSS**
   ```css
   /* app.css */
   .card { transition: transform 0.3s; }
   .card:hover { transform: translateY(-5px); }
   ```

### ❌ DON'T

1. **Don't use HTML strings**
   ```javascript
   // BAD!
   element.innerHTML = '<div class="card">...</div>';
   
   // GOOD!
   element.appendChild(soml({ 'div card': {...} }));
   ```

2. **Don't create elements manually**
   ```javascript
   // BAD!
   const el = document.createElement('div');
   el.className = 'card shadow';
   // ... many lines ...
   
   // GOOD!
   const el = soml({ 'div card shadow': {...} });
   ```

3. **Don't mix HTML and SOML**
   ```javascript
   // BAD!
   { div: '<p>HTML string</p>' }
   
   // GOOD!
   { div: { p: 'SOML object' } }
   ```

## Code Comparison

### Before (Verbose)
```javascript
{
  div: {
    class: 'card shadow-lg',
    children: [{
      div: {
        class: 'card-header bg-primary text-white',
        children: [
          { h5: { class: 'card-title mb-0', text: 'Header' } }
        ]
      }
    }, {
      div: {
        class: 'card-body',
        children: [
          { p: { class: 'card-text', text: 'Content' } },
          { button: { class: 'btn btn-primary', text: 'Action' } }
        ]
      }
    }]
  }
}
```

**22 lines**

### After (Concise)
```javascript
{
  'div card shadow-lg': {
    'div card-header bg-primary text-white': {
      'h5 card-title mb-0': 'Header'
    },
    'div card-body': {
      'p card-text': 'Content',
      'button btn btn-primary': 'Action'
    }
  }
}
```

**10 lines (55% reduction!)**

## Integration with CentralStation

SOML works perfectly with CentralStation's unified HTTP + WebSocket API:

```javascript
// server.js
const CentralStation = require('./src/centralstation');
const { soml } = require('./src/soml');

const cs = CentralStation({ type: 'express', port: 3000 });

// HTTP Routes
cs.route('/blog', 'GET', (req, res) => {
  const html = soml.toHtml(BlogPage({ posts }));
  res.send(html);
});

// WebSocket Events
cs.on('comment:create', (data, client) => {
  const comment = store.addComment(data);
  cs.broadcast('comment:created', comment);
});

cs.start();
```

## API Reference

### Server-Side

#### soml.toHtml(somlObject)
Convert SOML object to HTML string.

```javascript
const html = soml.toHtml({
  'div container': {
    'h1 text-center': 'Hello World'
  }
});
// → '<div class="container"><h1 class="text-center">Hello World</h1></div>'
```

### Client-Side

#### soml(somlObject)
Convert SOML object to DOM element.

```javascript
const el = soml({
  'div alert alert-success': 'Success!'
});
document.body.appendChild(el);
```

#### create(tagExpression, content)
Quick element creation.

```javascript
const badge = create('span-count badge bg-primary', '42');
// → <span id="count" class="badge bg-primary">42</span>
```

#### get(selector), set(selector, value), on(selector, handler)
DOM helpers (from soml-client.js).

```javascript
get('#myid')              // Get element by ID
set('#status', 'Ready')   // Set content
on('#btn.click', fn)      // Add event listener
```

## Summary

**SOML = One unified way to describe UI structure**

- ✅ Two syntaxes (canonical + concise)
- ✅ Pure SOML (never HTML strings)
- ✅ Server-side rendering
- ✅ Client-side dynamic updates
- ✅ Real-time with CentralStation
- ✅ 50-85% code reduction
- ✅ Works with any CSS framework

**The canonical syntax is the foundation. The concise syntax makes it beautiful. Together they make SOML complete.**

---

## Quick Start

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Create a page**
   ```javascript
   // pages/Home.soml.js
   const Home = () => ({
     head: { title: "Home" },
     body: {
       'container': {
         'h1 text-center': 'Welcome to SOML!'
       }
     }
   });
   module.exports = Home;
   ```

3. **Render it**
   ```javascript
   const { soml } = require('./src/soml');
   const Home = require('./pages/Home.soml');
   
   const html = soml.toHtml(Home());
   res.send(html);
   ```

4. **Add real-time**
   ```javascript
   script() {
     const cs = new CentralStation();
     cs.on('update', (data) => {
       const el = soml({ 'div alert': data.message });
       document.body.appendChild(el);
     });
   }
   ```

**That's it! You're building with SOML.** 🚂✨

For complete examples, see `blog2/` directory.

