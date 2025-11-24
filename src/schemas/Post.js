// Post schema with CentralStation patterns
const { defineSchema } = require('../schema');

const Post = defineSchema({
  name: 'Post',

  fields: {
    id: { 
      type: 'string', 
      primary: true, 
      default: () => Date.now().toString() 
    },
    title: { 
      type: 'string', 
      required: true 
    },
    content: { 
      type: 'string', 
      required: true 
    },
    authorId: { 
      type: 'string', 
      required: true 
    },
    createdAt: { 
      type: 'date', 
      default: () => new Date() 
    },
    updatedAt: { 
      type: 'date', 
      default: () => new Date() 
    }
  },

  views: {
    list: (posts) => ({
      html: {
        lang: 'en',
        head: {
          meta: { charset: 'UTF-8' },
          title: 'Blog Posts',
          link: {
            rel: 'stylesheet',
            href: 'https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css'
          }
        },
        body: {
          children: [
            {
              nav: {
                class: 'navbar navbar-light bg-light mb-4',
                children: [{
                  div: {
                    class: 'container',
                    children: [
                      { a: { class: 'navbar-brand', href: '/', content: 'SOML Blog' } },
                      {
                        div: {
                          class: 'navbar-nav flex-row gap-3',
                          children: [
                            { a: { class: 'nav-link', href: '/', content: 'Home' } },
                            { a: { class: 'nav-link', href: '/posts', content: 'Posts' } }
                          ]
                        }
                      }
                    ]
                  }
                }]
              }
            },
            {
              div: {
                class: 'container',
                children: [
                  { h1: { class: 'mb-4', content: 'Blog Posts' } },
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
                                children: [{
                                  div: {
                                    class: 'card-body',
                                    children: [
                                      { h5: { class: 'card-title', content: post.title } },
                                      { 
                                        p: { 
                                          class: 'card-text', 
                                          content: post.content.substring(0, 150) + '...' 
                                        } 
                                      },
                                      {
                                        a: {
                                          class: 'btn btn-primary',
                                          href: `/posts/${post.id}`,
                                          content: 'Read More'
                                        }
                                      }
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
            }
          ]
        }
      }
    }),

    detail: (post) => ({
      html: {
        lang: 'en',
        head: {
          meta: { charset: 'UTF-8' },
          title: post.title,
          link: {
            rel: 'stylesheet',
            href: 'https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css'
          }
        },
        body: {
          children: [
            {
              nav: {
                class: 'navbar navbar-light bg-light mb-4',
                children: [{
                  div: {
                    class: 'container',
                    children: [
                      { a: { class: 'navbar-brand', href: '/', content: 'SOML Blog' } },
                      {
                        div: {
                          class: 'navbar-nav flex-row gap-3',
                          children: [
                            { a: { class: 'nav-link', href: '/', content: 'Home' } },
                            { a: { class: 'nav-link', href: '/posts', content: 'Posts' } }
                          ]
                        }
                      }
                    ]
                  }
                }]
              }
            },
            {
              article: {
                class: 'container',
                children: [
                  { h1: { class: 'mb-3', content: post.title } },
                  { 
                    p: { 
                      class: 'text-muted mb-4', 
                      content: new Date(post.createdAt).toLocaleDateString() 
                    } 
                  },
                  { div: { class: 'content mb-4', content: post.content } },
                  { 
                    a: { 
                      class: 'btn btn-secondary', 
                      href: '/posts', 
                      content: '← Back to Posts' 
                    } 
                  }
                ]
              }
            }
          ]
        }
      }
    })
  },

  routes: {
    '/posts': 'list',
    '/posts/:id': 'detail'
  },

  events: {
    'post:created': (data) => {
      console.log('✓ New post created:', data.title);
    },
    'post:updated': (data) => {
      console.log('✓ Post updated:', data.title);
    },
    'post:deleted': (data) => {
      console.log('✓ Post deleted:', data.id);
    }
  }
});

module.exports = Post;

