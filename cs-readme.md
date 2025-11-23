# CentralStation & SOML: Schema-Oriented Web Development

## Introduction

CentralStation, combined with SOML (Simple Object Markup Language), offers a powerful, schema-oriented approach to web development. This system provides a seamless integration between client and server, enabling developers to create robust, real-time web applications with minimal boilerplate.

## Key Concepts

### 1. Schema-Oriented Development

At the core of our approach is the concept of schema-oriented development. Each entity in your application is defined by a schema that includes:

- Field definitions
- View representations
- Route handlers
- Event handlers

This unified definition ensures consistency across your entire application stack.

### 2. SOML (Simple Object Markup Language)

SOML is a JavaScript-based markup language that allows you to define UI components in a declarative, JSON-like syntax. It's designed to be:

- Lightweight and readable
- Easy to generate and manipulate programmatically
- Convertible to various formats (HTML, DOM, JSON)

### 3. Unified Client-Server Communication

CentralStation provides a seamless communication layer between client and server:

- WebSocket-based real-time updates
- Automatic state synchronization
- Event-driven architecture

## Key Features

1. **Automatic CRUD Operations**: Based on your schema definitions, CentralStation automatically generates CRUD operations and routes.

2. **Real-time Updates**: Changes in data are automatically propagated to all connected clients.

3. **Isomorphic Rendering**: The same SOML components can be rendered on both server and client.

4. **Theme Support**: Built-in theming system with easy customization.

5. **Internationalization**: Integrated i18n support for multi-language applications.

6. **Optimized CSS Processing**: Automatic extraction and processing of used CSS classes.

## Example: Defining a Blog Post
```javascript
const Post = {
  fields: {
    'id#': 'string',df]
    'title!': 'string',
    'content!': 'string',
    'author!': 'string',
    'createdAt': { type: 'date', default: () => Date.now() }
  },

  views: {
    'post': (post) => soml('article', {}, [
      {'h2', {}, post.title},
      {'div', { dangerouslySetInnerHTML: { html: marked(post.content) } }},
      {'small', {}, By ${ post.author } on ${ new Date(post.createdAt).toLocaleDateString() }},
    ])
  },

  routes: {
    '/blog': async (cs) => {
      const posts = await cs.db.findMany('blogpost', {}, { sort: { createdAt: -1 } });
      return {
        title: 'Blog Posts',
        content: cs.components.App({
          children: BlogPost.viewList(posts)
        })
      };
    },
    '/blog/:id': async (cs, req) => {
      const post = await cs.db.findOne('blogpost', { id: req.params.id });
      return {
        title: post.title,
        content: cs.components.App({
          children: BlogPost.view(post)
        })
      };
    }
  },

  db: {
    create: async (cs, data) => cs.db.create('blogpost', data),
    update: async (cs, data) => cs.db.update('blogpost', { id: data.id }, data),
    delete: async (cs, data) => cs.db.delete('blogpost', { id: data.id })}
  }
};
```

This single definition encapsulates the entire lifecycle of a blog post, from data structure to UI representation and CRUD operations.

## Benefits

1. **Reduced Boilerplate**: Define your data model and UI in one place.
2. **Consistency**: Ensure data integrity and UI consistency across your application.
3. **Rapid Development**: Quickly prototype and build complex applications.
4. **Scalability**: Easily add new features by defining new schemas.
5. **Real-time by Default**: Build real-time applications with minimal effort.
6. **Isomorphic**: Seamless server-side rendering and client-side hydration.

## Conclusion

CentralStation with SOML offers a unique, schema-oriented approach to web development. By centralizing the definition of your application's entities, it provides a powerful, consistent, and efficient way to build modern web applications. Whether you're building a simple blog or a complex real-time system, this approach can significantly streamline your development process.