// Blog2 Post Schema - Real-time enabled
const { defineSchema } = require('../../src/schema');
const { soml } = require('../../src/soml');

const Post = defineSchema({
  name: 'Post',

  fields: {
    id: { 
      type: 'string', 
      primary: true, 
      default: () => `post-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    },
    title: { 
      type: 'string', 
      required: true,
      minLength: 3,
      maxLength: 200
    },
    slug: {
      type: 'string',
      default: (data) => data.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')
    },
    content: { 
      type: 'string', 
      required: true,
      minLength: 10
    },
    excerpt: {
      type: 'string',
      default: (data) => data.content.substring(0, 200) + '...'
    },
    author: { 
      type: 'string', 
      required: true 
    },
    status: {
      type: 'string',
      default: 'draft',
      enum: ['draft', 'published', 'archived']
    },
    tags: {
      type: 'array',
      default: []
    },
    viewCount: {
      type: 'number',
      default: 0
    },
    commentCount: {
      type: 'number',
      default: 0
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
    // Card component for post lists
    card: (post) => ({
      div: {
        class: 'col-md-6 mb-4 post-card',
        'data-post-id': post.id,
        children: [{
          div: {
            class: 'card h-100 shadow-sm hover-shadow',
            children: [{
              div: {
                class: 'card-body',
                children: [
                  { 
                    h5: { 
                      class: 'card-title', 
                      children: [{
                        a: {
                          href: `/blog2/posts/${post.id}`,
                          class: 'text-decoration-none text-dark',
                          text: post.title
                        }
                      }]
                    } 
                  },
                  post.tags?.length > 0 ? {
                    div: {
                      class: 'mb-2',
                      children: post.tags.map(tag => ({
                        span: {
                          class: 'badge bg-secondary me-1',
                          text: tag
                        }
                      }))
                    }
                  } : '',
                  { 
                    p: { 
                      class: 'card-text text-muted', 
                      text: post.excerpt || post.content.substring(0, 150) + '...'
                    } 
                  },
                  {
                    div: {
                      class: 'd-flex justify-content-between align-items-center',
                      children: [
                        {
                          small: {
                            class: 'text-muted',
                            text: `By ${post.author} • ${new Date(post.createdAt).toLocaleDateString()}`
                          }
                        },
                        {
                          div: {
                            class: 'd-flex gap-2',
                            children: [
                              {
                                span: {
                                  class: 'badge bg-info',
                                  text: `👁 ${post.viewCount || 0}`
                                }
                              },
                              {
                                span: {
                                  class: 'badge bg-primary',
                                  text: `💬 ${post.commentCount || 0}`
                                }
                              }
                            ]
                          }
                        }
                      ]
                    }
                  }
                ]
              }
            }]
          }
        }]
      }
    }),

    // List view for multiple posts
    list: (posts) => posts.map(post => Post.views.card(post)),

    // Full post detail view
    detail: (post) => ({
      article: {
        class: 'post-detail',
        'data-post-id': post.id,
        children: [
          { h1: { class: 'display-4 mb-3', text: post.title } },
          {
            div: {
              class: 'post-meta mb-4 pb-3 border-bottom',
              children: [
                {
                  div: {
                    class: 'd-flex justify-content-between align-items-center flex-wrap',
                    children: [
                      {
                        div: {
                          children: [
                            {
                              span: {
                                class: 'text-muted me-3',
                                text: `By ${post.author}`
                              }
                            },
                            {
                              span: {
                                class: 'text-muted me-3',
                                text: new Date(post.createdAt).toLocaleString()
                              }
                            }
                          ]
                        }
                      },
                      {
                        div: {
                          class: 'd-flex gap-2',
                          children: [
                            {
                              span: {
                                class: 'badge bg-info',
                                text: `👁 ${post.viewCount || 0} views`
                              }
                            },
                            {
                              span: {
                                class: 'badge bg-primary',
                                id: 'comment-count-badge',
                                text: `💬 ${post.commentCount || 0} comments`
                              }
                            }
                          ]
                        }
                      }
                    ]
                  }
                },
                post.tags?.length > 0 ? {
                  div: {
                    class: 'mt-2',
                    children: post.tags.map(tag => ({
                      span: {
                        class: 'badge bg-secondary me-1',
                        text: `#${tag}`
                      }
                    }))
                  }
                } : ''
              ]
            }
          },
          {
            div: {
              class: 'post-content mb-5',
              style: 'line-height: 1.8; font-size: 1.1rem;',
              text: post.content
            }
          }
        ]
      }
    })
  },

  routes: {
    '/blog2': 'home',
    '/blog2/posts': 'list',
    '/blog2/posts/:id': 'detail',
    '/blog2/new': 'form'
  },

  events: {
    'post:created': (data) => {
      console.log('✓ Post created:', data.title);
    },
    'post:updated': (data) => {
      console.log('✓ Post updated:', data.title);
    },
    'post:deleted': (data) => {
      console.log('✓ Post deleted:', data.id);
    },
    'post:viewed': (data) => {
      console.log('✓ Post viewed:', data.id);
    }
  }
});

module.exports = Post;

