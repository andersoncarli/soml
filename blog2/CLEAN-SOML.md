# Blog2 - Clean SOML Architecture ✨

## The Final Form

Following the `/apps/todo` pattern exactly, Blog2 now uses **pure SOML** with:
- ✅ **NO JavaScript in strings** - `script()` is an actual function
- ✅ **Event handlers as functions** - `onclick() { ... }` 
- ✅ **Simple structure** - Clean nested objects
- ✅ **Minimal verbosity** - Direct property access

## Component Structure

### Following apps/todo.soml.js Pattern

```javascript
const HomePage = ({ posts, onlineCount }) => ({
  head: {
    title: "Blog2 - Real-Time",
    link: { rel: 'stylesheet', href: '...' },
    style: `...`
  },
  
  body: [
    // Library scripts
    { script: { src: '/centralstation.js' } },
    { script: { src: '/soml-client.js' } },
    
    // Content structure
    { div: {
      id: 'posts',
      class: 'row',
      children: posts.map(post => ({
        div: {
          'data-post-id': post.id,
          children: [{
            div: {
              class: 'card',
              children: [
                { h5: { text: post.title } },
                { p: { text: post.excerpt } }
              ]
            }
          }]
        }
      }))
    }}
  ],
  
  // CLIENT-SIDE SCRIPT - Actual JavaScript function!
  script() {
    const cs = new CentralStation();
    
    // Event handlers
    cs.on('connection', () => {
      set('#status', '✓ Connected');
    });
    
    // Event delegation
    on('#posts.click', (e) => {
      const card = e.target.closest('[data-post-id]');
      if (card) {
        location = '/blog2/posts/' + card.getAttribute('data-post-id');
      }
    });
    
    // Real-time updates
    cs.on('post:created', (post) => {
      // Update DOM
    });
  }
});
```

## Key Principles

### 1. script() is a Real Function

❌ **WRONG** (String content):
```javascript
script: {
  content: `
    const cs = new CentralStation();
    cs.on('connection', () => { ... });
  `
}
```

✅ **CORRECT** (Actual function):
```javascript
script() {
  const cs = new CentralStation();
  cs.on('connection', () => { ... });
}
```

### 2. Event Handlers are Functions

❌ **WRONG** (String attribute):
```javascript
onclick: "location='/blog2/posts/1'"
```

❌ **ALSO WRONG** (Template literal in function):
```javascript
onclick() {
  location = `/blog2/posts/${post.id}`;  // Won't work - post is out of scope
}
```

✅ **CORRECT** (Event delegation):
```javascript
// In structure: Just add data attribute
'data-post-id': post.id

// In script(): Use delegation
script() {
  on('#posts.click', (e) => {
    const id = e.target.closest('[data-post-id]').getAttribute('data-post-id');
    location = '/blog2/posts/' + id;
  });
}
```

### 3. Simple Object Structure

```javascript
body: [
  { script: { src: '/lib.js' } },
  { div: {
    id: 'container',
    class: 'main',
    children: [
      { h1: { text: 'Title' } },
      { p: { text: 'Content' } }
    ]
  }}
]
```

### 4. text vs content

Both work, but `text` is more common in the examples:

```javascript
{ h1: { text: 'Hello' } }      // ✅ Preferred
{ h1: { content: 'Hello' } }   // ✅ Also works
```

## Rendering

### Server-Side

The SOML renderer (`soml.toHtml`) now handles:

1. **script as function** - Extracts function body and wraps in `<script>` tag
2. **onclick as function** - Extracts function body for inline handler (if needed)
3. **text property** - Renders as text content
4. **children arrays** - Renders nested structures
5. **Filters Boolean** - Removes null/undefined/false from arrays

### Example Transformation

```javascript
// SOML
{
  script() {
    const cs = new CentralStation();
    cs.on('ready', () => console.log('Ready!'));
  }
}

// Rendered HTML
<script>
  const cs = new CentralStation();
  cs.on('ready', () => console.log('Ready!'));
</script>
```

## Helper Functions

### From apps/proto/dom.js

```javascript
get(selector)           // Get element(s)
set(selector, content)  // Set element content
on(selector, handler)   // Event delegation
```

### Usage in script()

```javascript
script() {
  // Get elements
  const form = get('#form');
  const list = get('#list');
  
  // Set content
  set('#status', 'Connected');
  set('#count.value', '42');
  
  // Event delegation
  on('#form.submit', (e) => {
    e.preventDefault();
    // Handle submit
  });
  
  on('.card.click, .button.click', (e) => {
    // Multiple selectors
  });
}
```

## Real-World Example

### Complete HomePage

```javascript
const HomePage = ({ posts = [], onlineCount = 0 }) => ({
  head: {
    title: "Blog2 - Real-Time",
    meta: [
      { charset: 'UTF-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1.0' }
    ],
    link: { rel: 'stylesheet', href: 'https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css' },
    style: `
      body { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
      .card { cursor: pointer; transition: all 0.3s; }
      .card:hover { transform: translateY(-5px); }
    `
  },
  
  body: [
    // External libraries
    { script: { src: '/centralstation.js' } },
    { script: { src: '/soml-client.js' } },
    
    // Status badges
    { div: {
      id: 'status-bar',
      class: 'connection-status',
      children: [
        { span: { id: 'status', class: 'badge bg-success', text: '✓ Connected' } },
        { span: { id: 'online', class: 'badge bg-info', text: `👥 ${onlineCount}` } }
      ]
    }},
    
    // Main content
    { div: {
      class: 'container',
      children: [{
        div: {
          class: 'main-container',
          children: [
            { h1: { class: 'text-center', text: '🚂 Blog2' } },
            { p: { class: 'text-muted', text: 'Real-Time Blogging' } },
            { div: {
              id: 'posts',
              class: 'row',
              children: posts.map(post => ({
                div: {
                  class: 'col-md-6 mb-4',
                  'data-post-id': post.id,
                  children: [{
                    div: {
                      class: 'card',
                      children: [{
                        div: {
                          class: 'card-body',
                          children: [
                            { h5: { text: post.title } },
                            { p: { text: post.excerpt } }
                          ]
                        }
                      }]
                    }
                  }]
                }
              }))
            }}
          ]
        }
      }]
    }}
  ],
  
  // Client behavior - actual JavaScript!
  script() {
    const cs = new CentralStation();
    
    // Connection status
    cs.on('connection', () => {
      set('#status', '✓ Connected');
      get('#status').className = 'badge bg-success';
    });
    
    cs.on('disconnect', () => {
      set('#status', '✗ Disconnected');
      get('#status').className = 'badge bg-danger';
    });
    
    // Online count
    cs.on('users:count', (data) => {
      set('#online', `👥 ${data.count}`);
    });
    
    // Click handling
    on('#posts.click', (e) => {
      const card = e.target.closest('[data-post-id]');
      if (card) {
        location = '/blog2/posts/' + card.getAttribute('data-post-id');
      }
    });
    
    // Real-time new posts
    cs.on('post:created', (post) => {
      const posts = get('#posts');
      const col = document.createElement('div');
      col.className = 'col-md-6 mb-4 fade-in';
      col.setAttribute('data-post-id', post.id);
      col.innerHTML = `
        <div class="card">
          <div class="card-body">
            <h5>${post.title}</h5>
            <p>${post.excerpt}</p>
          </div>
        </div>
      `;
      posts.insertBefore(col, posts.firstChild);
    });
  }
});
```

## Architecture Summary

```
blog2/
├── server.js                # Minimal (120 lines)
├── store.js                 # Data management
├── pages/
│   └── HomePage.soml.js    # Everything in one file!
├── components/             # (empty - not needed yet)
└── src/
    ├── soml.js             # Renderer with script() support
    └── soml-client.js      # Helpers: get(), set(), on()
```

## Benefits

✅ **Pure JavaScript** - No string content with code  
✅ **Clean structure** - Simple nested objects  
✅ **Real functions** - `script()` and `onclick()` are actual functions  
✅ **Event delegation** - Clean, efficient event handling  
✅ **One file** - Everything in component file  
✅ **Real-time** - WebSocket built-in  
✅ **Debuggable** - Function extraction preserves structure  

## Comparison

### apps/todo.soml.js Pattern

```javascript
return {
  body: {
    form: {
      id: "form",
      input: { id: "todo", type: "text" },
      onsubmit: () => {
        var todo = { text: get('#todo').value }
        store.create(todo, render)
        set('#todo.value', '')
        return false
      }
    }
  },
  script() {
    const store = db.open('todo', render)
    const list = get('#list')
    function render() { ... }
  }
}
```

### Blog2 HomePage.soml.js

```javascript
const HomePage = ({ posts }) => ({
  body: [
    { div: {
      id: 'posts',
      children: posts.map(post => ({
        div: {
          'data-post-id': post.id,
          children: [...]
        }
      }))
    }}
  ],
  script() {
    const cs = new CentralStation()
    on('#posts.click', (e) => {
      const id = e.target.closest('[data-post-id]').getAttribute('data-post-id')
      location = '/blog2/posts/' + id
    })
    cs.on('post:created', (post) => { ... })
  }
});
```

**Same pattern, same simplicity!** 🎯

---

**Blog2** - Pure SOML, as it should be. 🚂✨

Server running at: http://localhost:3000/blog2

