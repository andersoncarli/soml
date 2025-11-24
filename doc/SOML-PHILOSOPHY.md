# SOML Philosophy: Never Use HTML

## Core Principle

**In a SOML application, you should NEVER use HTML directly. Always think in SOML terms.**

## Why?

### 1. Consistency
- One unified way to describe UI structure
- No context switching between HTML strings and SOML objects
- Easier to maintain and reason about

### 2. Type Safety
- SOML objects are JavaScript objects
- Can be validated, transformed, and composed
- HTML strings are opaque and error-prone

### 3. Composability
- SOML structures can be easily merged and modified
- Functions can return SOML, which can be embedded anywhere
- Reusable components without template strings

### 4. Tooling
- Better IDE support (autocomplete, refactoring)
- Easier to test and mock
- Can be serialized, analyzed, and optimized

## The Two Syntaxes

### Canonical Syntax (Verbose)
The full, explicit SOML syntax that supports all features:

```javascript
{
  div: {
    class: 'card shadow',
    id: 'my-card',
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
- Event handlers attached
- Dynamic data binding
- Maximum clarity required

### Shortcut Syntax (Concise)
The ultra-concise syntax with inline classes:

```javascript
{
  'div-my-card card shadow': {
    'data-post-id': '123',
    'h5 card-title': 'Title',
    'p card-text': 'Content'
  }
}
```

**Use when:**
- Simple structure with utility classes
- Writing UI layouts quickly
- Bootstrap/Tailwind-style development
- Maximum brevity preferred

**Both syntaxes are valid and can be mixed!**

## Client-Side SOML

### The Old Way (BAD ❌)

```javascript
// Using HTML strings - DO NOT DO THIS!
cs.on('post:created', (post) => {
  const el = document.createElement('div');
  el.innerHTML = `
    <div class="card">
      <h5>${post.title}</h5>
      <p>${post.content}</p>
    </div>
  `;
  container.appendChild(el);
});
```

**Problems:**
- HTML strings mixed with JavaScript
- Security risk (XSS if not careful)
- No structure, just text
- Hard to test and modify

### The SOML Way (GOOD ✓)

```javascript
// Using pure SOML - THE RIGHT WAY!
cs.on('post:created', (post) => {
  const postCard = {
    div: {
      class: 'card',
      children: [
        { h5: { text: post.title } },
        { p: { text: post.content } }
      ]
    }
  };
  
  // Convert SOML to DOM element
  const el = soml(postCard);
  container.appendChild(el);
});
```

**Benefits:**
- Pure SOML structure
- Type-safe and composable
- Easy to test and modify
- No XSS risk

### Even Better with Concise Syntax

```javascript
cs.on('post:created', (post) => {
  const postCard = {
    'div card': {
      'h5 card-title': post.title,
      'p card-text': post.content
    }
  };
  
  container.appendChild(soml(postCard));
});
```

## Client-Side Functions

The `soml-client.js` provides helper functions:

### soml(obj) - Convert SOML to DOM

```javascript
const somlObj = {
  'div alert alert-success': 'Hello from SOML!'
};

const element = soml(somlObj);
document.body.appendChild(element);
```

### create(tagExpr, content) - Quick Element Creation

```javascript
// Create element with concise syntax
const badge = create('span-count badge bg-primary', '42');
// → <span id="count" class="badge bg-primary">42</span>

container.appendChild(badge);
```

### Examples

#### Simple Element

```javascript
// SOML
const el = soml({ 'h1 text-center': 'Welcome' });

// Instead of
const el = document.createElement('h1');
el.className = 'text-center';
el.textContent = 'Welcome';
```

#### Nested Structure

```javascript
// SOML
const card = soml({
  'div card shadow': {
    'div card-header': 'Header',
    'div card-body': {
      'h5 card-title': 'Title',
      'p card-text': 'Content'
    }
  }
});

// Instead of messy innerHTML
```

#### Dynamic Content

```javascript
// SOML
function createPostCard(post) {
  return soml({
    'div-post-${post.id} card': {
      'h5 card-title': post.title,
      'p card-text': post.content,
      'small text-muted': `By ${post.author}`
    }
  });
}

posts.forEach(post => {
  container.appendChild(createPostCard(post));
});
```

#### With Attributes

```javascript
// SOML (canonical syntax for complex attributes)
const form = soml({
  form: {
    method: 'post',
    action: '/submit',
    children: [
      {
        'input-email form-control': {
          type: 'email',
          placeholder: 'Email',
          required: true
        }
      },
      { 'button-submit btn btn-primary': 'Submit' }
    ]
  }
});
```

## Server-Side SOML

### Page Components

```javascript
// pages/HomePage.soml.js
const HomePage = ({ posts }) => ({
  head: {
    title: "Blog",
    link: { rel: 'stylesheet', href: '/styles/app.css' }
  },
  
  body: {
    'container mt-5': {
      'h1 text-center mb-4': 'My Blog',
      
      'posts-row row': posts.map(post => ({
        'div col-md-6 mb-4': {
          'data-post-id': post.id,
          'div card shadow': {
            'div card-body': {
              'h5 card-title': post.title,
              'p card-text text-muted': post.excerpt
            }
          }
        }
      }))
    },
    
    script: { src: '/soml-client.js' },
    script() {
      // Client-side code
      const cs = new CentralStation();
      
      cs.on('post:created', (post) => {
        // Use SOML, not HTML!
        const card = soml({
          'div col-md-6 mb-4': {
            'div card shadow': {
              'div card-body': {
                'h5 card-title': post.title,
                'p card-text': post.excerpt
              }
            }
          }
        });
        
        get('#posts').prepend(card);
      });
    }
  }
});

module.exports = HomePage;
```

### Rendering to HTML

```javascript
// server.js
const { soml } = require('./src/soml');
const HomePage = require('./pages/HomePage.soml');

cs.route('/blog', 'GET', (req, res) => {
  const posts = store.getPosts();
  
  // Convert SOML to HTML only at the final step
  const html = soml.toHtml(HomePage({ posts }));
  
  res.send(html);
});
```

## Migration Guide

### Step 1: Identify HTML Usage

Look for:
- `innerHTML =`
- `outerHTML =`
- Template literals with HTML
- `document.createElement` chains

### Step 2: Convert to SOML

**Before:**
```javascript
element.innerHTML = `
  <div class="card">
    <h5>${title}</h5>
  </div>
`;
```

**After:**
```javascript
const card = soml({
  'div card': {
    h5: title
  }
});
element.appendChild(card);
```

### Step 3: Use Concise Syntax

**Before (canonical):**
```javascript
{
  div: {
    class: 'card shadow-lg',
    children: [
      { h5: { class: 'card-title', text: title } }
    ]
  }
}
```

**After (concise):**
```javascript
{
  'div card shadow-lg': {
    'h5 card-title': title
  }
}
```

## Best Practices

### ✓ DO

1. **Use SOML objects everywhere**
   ```javascript
   const card = { 'div card': { h5: 'Title' } };
   ```

2. **Use concise syntax for layouts**
   ```javascript
   'container mt-5': { 'row': [...] }
   ```

3. **Use canonical syntax for complex attributes**
   ```javascript
   form: { method: 'post', action: '/submit', ... }
   ```

4. **Convert to DOM at insertion time**
   ```javascript
   container.appendChild(soml(somlObject));
   ```

5. **Keep styles in CSS, structure in SOML**
   ```css
   /* app.css */
   .card { ... }
   ```

### ✗ DON'T

1. **Don't use HTML strings**
   ```javascript
   // BAD
   el.innerHTML = '<div class="card">...</div>';
   ```

2. **Don't mix HTML and SOML**
   ```javascript
   // BAD
   { div: '<p>HTML string</p>' }
   ```

3. **Don't create elements manually when SOML can**
   ```javascript
   // BAD
   const el = document.createElement('div');
   el.className = 'card';
   // ... many lines ...
   
   // GOOD
   const el = soml({ 'div card': {...} });
   ```

## Summary

**SOML is your single source of truth for UI structure.**

- ✓ Server-side: Write SOML, render to HTML
- ✓ Client-side: Write SOML, convert to DOM
- ✓ Never write HTML strings
- ✓ Think in SOML terms
- ✓ Use concise syntax for common patterns
- ✓ Use canonical syntax for complex cases

**SOML = Consistency + Composability + Type Safety + Tooling**

The canonical (verbose) syntax is the foundation. The concise (shortcut) syntax makes common patterns easier. Both compile to the same thing and can be freely mixed.

---

**Remember: In a SOML application, HTML is an output format, not an input!**

