# SOML Concise Syntax with Space-Separated Classes

## Overview

SOML now supports an ultra-concise syntax inspired by Tailwind's inline utility classes, allowing you to write cleaner, more readable code by embedding classes directly in tag expressions.

## Syntax

### Basic Pattern

```javascript
'tagname classes': content
```

### Examples

#### 1. Simple Tag with Classes

**Old:**
```javascript
h5: { class: 'card-title text-primary', text: 'Hello' }
```

**New:**
```javascript
'h5 card-title text-primary': 'Hello'
```

#### 2. Tag with ID and Classes

**Old:**
```javascript
button: { id: 123, class: 'btn btn-primary', text: 'Click' }
```

**New:**
```javascript
'button-123 btn btn-primary': 'Click'
```

#### 3. Div with Classes (Default Tag)

**Old:**
```javascript
div: { class: 'container mt-5', children: [...] }
```

**New:**
```javascript
'container mt-5': {...}
```

#### 4. Complex Nested Structure

**Old:**
```javascript
{
  div: {
    class: 'card h-100 shadow',
    children: [{
      div: {
        class: 'card-body',
        children: [
          { h5: { class: 'card-title text-primary', text: 'Title' } },
          { p: { class: 'card-text text-muted', text: 'Content' } }
        ]
      }
    }]
  }
}
```

**New:**
```javascript
{
  'div card h-100 shadow': {
    'div card-body': {
      'h5 card-title text-primary': 'Title',
      'p card-text text-muted': 'Content'
    }
  }
}
```

## Full Example: Blog2 HomePage

### Before (Old Verbose Syntax)

```javascript
{
  div: {
    class: 'container mt-5',
    children: [{
      div: {
        class: 'bg-white rounded-3 shadow-lg p-4',
        children: [
          { 
            h1: { 
              class: 'text-center mb-2', 
              text: '🚂 Blog2' 
            } 
          },
          { 
            p: { 
              class: 'text-center text-muted mb-5', 
              text: 'Real-Time Blogging' 
            } 
          },
          {
            div: {
              id: 'posts',
              class: 'row',
              children: posts.map(post => ({
                div: {
                  class: 'col-md-6 mb-4',
                  'data-post-id': post.id,
                  children: [{
                    div: {
                      class: 'card h-100 shadow',
                      children: [{
                        div: {
                          class: 'card-body',
                          children: [
                            { h5: { class: 'card-title', text: post.title } },
                            { p: { class: 'card-text text-muted', text: post.excerpt } }
                          ]
                        }
                      }]
                    }
                  }]
                }
              }))
            }
          }
        ]
      }
    }]
  }
}
```

### After (New Concise Syntax)

```javascript
{
  'container mt-5': {
    'div bg-white rounded-3 shadow-lg p-4': {
      'h1 text-center mb-2': '🚂 Blog2',
      'p text-center text-muted mb-5': 'Real-Time Blogging',
      
      'posts-row row': posts.map(post => ({
        'div col-md-6 mb-4': {
          'data-post-id': post.id,
          'div card h-100 shadow': {
            'div card-body': {
              'h5 card-title': post.title,
              'p card-text text-muted': post.excerpt
            }
          }
        }
      }))
    }
  }
}
```

## Benefits

### 1. **Drastically Reduced Verbosity**
- No more `class:` property
- No more nested `children:` arrays for simple cases
- Direct assignment: `'tag classes': content`

### 2. **Better Readability**
- Structure is immediately visible
- Classes are inline like HTML/Tailwind
- Less nesting, less visual noise

### 3. **Familiar Pattern**
- Works like Tailwind's utility classes
- Similar to writing inline HTML
- Easy to learn for web developers

### 4. **Flexible**
- Mix old and new syntax
- Use where it makes sense
- Gradual migration path

## Comparison Table

| Feature | Old Syntax | New Syntax | Savings |
|---------|------------|------------|---------|
| Simple tag with classes | `h5: { class: 'a b', text: 'X' }` | `'h5 a b': 'X'` | 50% |
| Tag with ID + classes | `div: { id: 'x', class: 'a b' }` | `'div-x a b': {}` | 60% |
| Nested structure | 15+ lines | 5 lines | 70% |

## Technical Details

### Parsing Rules

1. **Space-separated tokens after tag** → classes
   - `'h5 card-title text-primary'` → `<h5 class="card-title text-primary">`

2. **Dash after tag** → ID (if number/string), else class
   - `'button-123'` → `<button id="123">`
   - `'container-main'` → `<div id="container" class="main">`

3. **Dot-separated after tag** → classes
   - `'p.my-class'` → `<p class="my-class">`

4. **Combined**
   - `'button-123.btn.primary'` → `<button id="123" class="btn primary">`
   - `'div-container card shadow'` → `<div id="container" class="card shadow">`

### Default Tag

When no HTML tag is detected at the start, defaults to `div`:
- `'container-main'` → `<div id="container" class="main">`
- `'hero-section shadow-lg'` → `<div id="hero" class="section shadow-lg">`

## Migration Guide

### Step 1: Identify Patterns

Look for:
- Simple tags with only `class` and `text`
- Repeated class attribute assignments
- Deep nesting of `children` arrays

### Step 2: Replace Gradually

Start with the deepest/simplest elements:

```javascript
// Before
{ span: { class: 'badge bg-primary', text: count } }

// After
{ 'span badge bg-primary': count }
```

### Step 3: Simplify Nested Structures

```javascript
// Before
div: {
  class: 'card',
  children: [{
    div: {
      class: 'card-body',
      children: [...]
    }
  }]
}

// After
'div card': {
  'div card-body': {
    ...
  }
}
```

## Best Practices

### 1. **Use for Utility Classes**
Perfect for Bootstrap, Tailwind, and similar frameworks:
```javascript
'button-submit btn btn-primary btn-lg': 'Submit'
```

### 2. **Keep IDs Meaningful**
```javascript
'form-login': { ... }  // id="login"
'nav-header': { ... }  // id="header"
```

### 3. **Separate Concerns**
Move styles to CSS file, keep only utility classes inline:
```javascript
// Good
'div card shadow': { ... }

// Avoid
'div': { style: 'background: red; padding: 10px;' }
```

### 4. **Mix When Needed**
Use new syntax where it helps, old syntax where it doesn't:
```javascript
{
  'container': {
    // New syntax for structure
    'h1 text-center': 'Title',
    
    // Old syntax for complex attributes
    form: {
      action: '/submit',
      method: 'post',
      onSubmit: handleSubmit,
      'div form-group': {
        ...
      }
    }
  }
}
```

## Examples from Blog2

See `/blog2/pages/HomePage-ultra.soml.js` for a complete example using the new concise syntax.

## Summary

The new concise syntax reduces code by **50-70%** while improving readability. It's perfect for modern CSS frameworks and aligns with how developers already think about styling components.

**Old way:** Verbose, nested, explicit
**New way:** Concise, flat, inline

Both syntaxes are supported - use what works best for your use case!

