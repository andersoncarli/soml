# SOML - Simple Object Markup Language

**A JavaScript-first approach to UI definition that brings the power of objects to markup.**

## What is SOML?

SOML (Simple Object Markup Language) is a declarative markup system that uses JavaScript objects to define UI structures. It bridges the gap between JSON's simplicity and HTML's expressiveness, enabling programmatic UI generation with minimal boilerplate.

```javascript
const { soml } = require('./soml');

// Define UI as objects
const page = {
  html: {
    head: { title: 'My App' },
    body: {
      h1: 'Hello World',
      p: 'Welcome to SOML'
    }
  }
};

// Convert to HTML
soml.toHtml(page);
// Output: <html><head><title>My App</title></head><body><h1>Hello World</h1><p>Welcome to SOML</p></body></html>
```

## Core Strengths

### 1. **Programmatic & Declarative**

SOML lets you define UI using plain JavaScript objects, making it easy to generate, manipulate, and compose interfaces programmatically while maintaining readability.

```javascript
// Easy to generate dynamically
const posts = [
  { title: 'Post 1', content: 'Content 1' },
  { title: 'Post 2', content: 'Content 2' }
];

const postList = {
  div: {
    class: 'posts',
    children: posts.map(post => ({
      article: {
        class: 'post',
        children: [
          { h2: post.title },
          { p: post.content }
        ]
      }
    }))
  }
};
```

### 2. **Shorthand Tag Notation**

SOML supports a concise tag syntax that makes common patterns easier to write:

```javascript
// Parse shorthand tags
parseTag('div-42.card.primary')
// Returns: { div: { id: 42, class: ['card', 'primary'] } }

parseTag('h1.hero-title')
// Returns: { h1: { id: 0, class: ['hero-title'] } }

// Use in markup
const widget = {
  'section-main.container': {
    'h1-title.hero': 'Welcome',
    'p.description': 'Get started'
  }
};
```

**Syntax**: `tag[-id][.class1.class2...]`

### 3. **Isomorphic Rendering**

The same SOML code works on both server and client, enabling true universal JavaScript applications.

```javascript
// Server-side
app.get('/page', (req, res) => {
  const page = { html: { body: { h1: 'Server Rendered' } } };
  res.send(soml.toHtml(page));
});

// Client-side
const page = { div: { h1: 'Client Rendered' } };
document.body.innerHTML = soml.toHtml(page);
```

### 4. **Plugin Architecture**

SOML's extensible plugin system allows custom transformations and integrations:

```javascript
// Plugins handle different input types
soml.plugin('custom', {
  test: (input) => typeof input === 'string' && input.startsWith('@'),
  from: (input) => {
    const name = input.slice(1);
    return { component: { name } };
  },
  to: (somlObj) => `@${somlObj.component.name}`
});

// Use the plugin
soml('@MyComponent');  // Processed by custom plugin
```

**Built-in Plugins**:
- `function` - Execute functions and process results
- `array` - Map over arrays recursively
- `object` - Handle plain objects
- `string` - Parse strings (HTML, JSON, tags)
- `html` - Convert HTML ↔ SOML
- `json` - Parse JSON strings
- `tag` - Parse tag shorthand notation

### 5. **Multiple Output Formats**

Convert SOML to various formats seamlessly:

```javascript
const ui = { div: { class: 'card', content: 'Hello' } };

// To HTML string
soml.toHtml(ui);
// <div class="card">Hello</div>

// To JSON
soml.toJson(ui);
// '{"div":{"class":"card","content":"Hello"}}'

// To Array format
soml.toArray(ui);
// [{ div: { class: 'card', content: 'Hello' } }]
```

### 6. **Zero Template Syntax**

No special template language to learn - just JavaScript:

```javascript
// Conditional rendering
const page = {
  div: {
    children: [
      user.isAdmin && { button: 'Admin Panel' },
      { h1: `Welcome ${user.name}` },
      items.length > 0 ? { ul: items.map(i => ({ li: i })) } : { p: 'No items' }
    ].filter(Boolean)
  }
};
```

### 7. **Type Safety Ready**

SOML works naturally with TypeScript and can be easily typed:

```typescript
interface SomlElement {
  [tag: string]: string | number | SomlAttributes | SomlElement[];
}

interface SomlAttributes {
  id?: string | number;
  class?: string | string[];
  content?: string;
  children?: SomlElement[];
  [attr: string]: any;
}
```

### 8. **Composable & Reusable**

Build UI components as functions that return SOML objects:

```javascript
const Card = ({ title, content, footer }) => ({
  div: {
    class: 'card',
    children: [
      { h3: { class: 'card-title', content: title } },
      { div: { class: 'card-body', content } },
      footer && { div: { class: 'card-footer', children: footer } }
    ].filter(Boolean)
  }
});

// Use it
const myCard = Card({
  title: 'Article',
  content: 'Content here',
  footer: [{ button: 'Read More' }]
});
```

### 9. **Integration with CentralStation**

SOML powers the view layer in CentralStation's entity-driven architecture:

```javascript
const Post = {
  fields: {
    'id#': 'autoinc',
    'title!': 'string',
    'content!': 'string'
  },
  
  views: {
    card: (post) => ({
      article: {
        class: 'post-card',
        children: [
          { h2: post.title },
          { p: post.content },
          { a: { href: `/posts/${post.id}`, content: 'Read More' } }
        ]
      }
    })
  }
};
```

### 10. **Minimal Bundle Size**

SOML core is lightweight (~5KB minified) with no dependencies for basic usage:

```javascript
// Core functionality
const { soml, parseTag } = require('./soml');  // < 5KB

// Extended features (HTML parsing)
// Only loads htmlparser2 when needed
```

## Real-World Example

Building a blog with SOML:

```javascript
const BlogPost = ({ title, author, date, content, tags }) => ({
  article: {
    class: 'blog-post',
    children: [
      {
        header: {
          children: [
            { h1: title },
            {
              div: {
                class: 'meta',
                children: [
                  { span: { class: 'author', content: `By ${author}` } },
                  { time: { datetime: date, content: new Date(date).toLocaleDateString() } }
                ]
              }
            }
          ]
        }
      },
      { div: { class: 'content', content } },
      {
        footer: {
          class: 'tags',
          children: tags.map(tag => ({ 
            span: { class: 'tag', content: tag } 
          }))
        }
      }
    ]
  }
});

// Render
const html = soml.toHtml(BlogPost({
  title: 'Getting Started with SOML',
  author: 'John Doe',
  date: '2025-11-23',
  content: 'SOML makes UI definition simple...',
  tags: ['javascript', 'soml', 'web']
}));
```

## API Reference

### Core Functions

#### `soml(...params)`
Process one or more inputs through the plugin system.

```javascript
soml({ div: 'Hello' })                    // Single object
soml('div-1.card', { h1: 'Title' })      // Multiple params
soml(() => ({ p: 'Dynamic' }))           // Function execution
```

#### `parseTag(tagString)`
Parse shorthand tag notation.

```javascript
parseTag('div-42.card.primary')
// { div: { id: 42, class: ['card', 'primary'] } }
```

### Conversion Methods

#### `soml.toHtml(somlObject)`
Convert SOML to HTML string.

```javascript
soml.toHtml({ div: { class: 'box', content: 'Text' } })
// '<div class="box">Text</div>'
```

#### `soml.toJson(somlObject)`
Convert SOML to JSON string.

```javascript
soml.toJson({ div: 'Hello' })
// '{"div":"Hello"}'
```

#### `soml.toArray(somlObject)`
Normalize to array format.

```javascript
soml.toArray({ div: 'Hello' })
// [{ div: 'Hello' }]
```

#### `soml.toObj(somlObject)`
Normalize to object format.

```javascript
soml.toObj([{ div: 'Hello' }])
// { div: 'Hello' }
```

### Plugin System

#### `soml.plugin(name, { test, from, to })`
Register a new plugin.

```javascript
soml.plugin('markdown', {
  test: (input) => typeof input === 'string' && input.includes('# '),
  from: (md) => ({ div: { content: convertMarkdown(md) } }),
  to: (soml) => convertToMarkdown(soml)
});
```

#### Access Plugin Methods

```javascript
// Direct access
soml.html.from('<div>Hello</div>')
soml.html.to({ div: 'Hello' })

// Convenience methods
soml.fromHtml('<div>Hello</div>')
soml.toHtml({ div: 'Hello' })
```

## Comparison with Other Approaches

### vs JSX
```javascript
// JSX (requires transpilation)
const Component = () => (
  <div className="card">
    <h2>{title}</h2>
  </div>
);

// SOML (pure JavaScript)
const Component = () => ({
  div: {
    class: 'card',
    h2: title
  }
});
```

### vs Template Strings
```javascript
// Template strings (no type safety, manual escaping)
const html = `
  <div class="${className}">
    <h2>${title}</h2>
  </div>
`;

// SOML (structured, composable)
const ui = {
  div: {
    class: className,
    h2: title
  }
};
```

### vs Virtual DOM Libraries
```javascript
// React (framework-specific, large bundle)
createElement('div', { className: 'card' }, 
  createElement('h2', null, title)
);

// SOML (framework-agnostic, minimal)
{
  div: {
    class: 'card',
    h2: title
  }
}
```

## Best Practices

### 1. Use Functions for Components
```javascript
const Button = ({ label, variant = 'primary', onClick }) => ({
  button: {
    class: `btn btn-${variant}`,
    onclick: onClick,
    content: label
  }
});
```

### 2. Leverage Spread for Attributes
```javascript
const Input = (props) => ({
  input: {
    type: 'text',
    ...props
  }
});
```

### 3. Keep Structure Flat When Possible
```javascript
// Good
{ div: { h1: 'Title', p: 'Content' } }

// Less ideal for simple cases
{ div: { children: [{ h1: 'Title' }, { p: 'Content' }] } }
```

### 4. Use Arrays for Dynamic Content
```javascript
const List = ({ items }) => ({
  ul: items.map(item => ({ li: item }))
});
```

## Integration Examples

### Express Server
```javascript
const express = require('express');
const { soml } = require('./soml');

app.get('/', (req, res) => {
  const page = {
    html: {
      head: { title: 'Home' },
      body: { h1: 'Welcome' }
    }
  };
  res.send('<!DOCTYPE html>' + soml.toHtml(page));
});
```

### Static Site Generation
```javascript
const fs = require('fs');
const pages = ['home', 'about', 'contact'];

pages.forEach(page => {
  const content = require(`./pages/${page}`);
  const html = '<!DOCTYPE html>' + soml.toHtml(content);
  fs.writeFileSync(`./dist/${page}.html`, html);
});
```

### API Responses
```javascript
app.get('/api/widget', (req, res) => {
  const widget = {
    div: {
      class: 'widget',
      h3: 'Widget Title',
      p: 'Widget content'
    }
  };
  res.json({
    html: soml.toHtml(widget),
    soml: widget
  });
});
```

## Performance Considerations

- **Fast**: Direct object manipulation, no parsing overhead
- **Lightweight**: Minimal runtime, no heavy dependencies
- **Cacheable**: Generated HTML can be cached like any string
- **Streaming**: Can be adapted for streaming HTML generation

## Future Roadmap

- [ ] TypeScript definitions
- [ ] Browser-optimized build
- [ ] SOML → JSX transpiler
- [ ] Diff/patch algorithms for dynamic updates
- [ ] Server-side streaming
- [ ] Schema validation
- [ ] Developer tools & debugging
- [ ] Component library ecosystem

## Philosophy

SOML embraces these principles:

1. **JavaScript-first** - No new syntax to learn
2. **Data-driven** - UI as data structures
3. **Composable** - Build complex from simple
4. **Universal** - Same code, multiple environments
5. **Minimal** - Small API surface, maximum flexibility
6. **Pragmatic** - Solves real problems simply

## Contributing

SOML is open for contributions. Key areas:

- Plugin development
- Performance optimizations
- Documentation improvements
- Example applications
- Integration guides

## License

MIT

---

**SOML** - Simple, Powerful, JavaScript.

