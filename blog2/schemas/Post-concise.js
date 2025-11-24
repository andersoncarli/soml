// Blog2 Post Schema - Concise SOML syntax
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
    // Card component for post lists - CONCISE SOML!
    card: (post) => ({
      'div col-md-6 mb-4 post-card': {
        'data-post-id': post.id,
        'div card h-100 shadow-sm hover-shadow': {
          'div card-body': {
            'h5 card-title': {
              a: {
                href: `/blog2/posts/${post.id}`,
                class: 'text-decoration-none text-dark',
                text: post.title
              }
            },
            ...(post.tags?.length > 0 && {
              'div mb-2': post.tags.map(tag => ({
                'span badge bg-secondary me-1': tag
              }))
            }),
            'p card-text text-muted': post.excerpt || post.content.substring(0, 150) + '...',
            'div d-flex justify-content-between align-items-center': {
              'small text-muted': `By ${post.author} • ${new Date(post.createdAt).toLocaleDateString()}`,
              'div d-flex gap-2': [
                { 'span badge bg-info': `👁 ${post.viewCount || 0}` },
                { 'span badge bg-primary': `💬 ${post.commentCount || 0}` }
              ]
            }
          }
        }
      }
    }),

    // List view for multiple posts
    list: (posts) => posts.map(post => Post.views.card(post)),

    // Full post detail view - CONCISE SOML!
    detail: (post) => ({
      'article post-detail': {
        'data-post-id': post.id,
        'h1 display-4 mb-3': post.title,
        'div post-meta mb-4 pb-3 border-bottom': [
          {
            'div d-flex justify-content-between align-items-center flex-wrap': {
              'div': [
                { 'span text-muted me-3': `By ${post.author}` },
                { 'span text-muted me-3': new Date(post.createdAt).toLocaleString() }
              ],
              'div d-flex gap-2': [
                { 'span badge bg-info': `👁 ${post.viewCount || 0} views` },
                { 'span-comment-count-badge badge bg-primary': `💬 ${post.commentCount || 0} comments` }
              ]
            }
          },
          ...(post.tags?.length > 0 ? [{
            'div mt-2': post.tags.map(tag => ({
              'span badge bg-secondary me-1': `#${tag}`
            }))
          }] : [])
        ],
        'div post-content mb-5': {
          style: 'line-height: 1.8; font-size: 1.1rem; white-space: pre-wrap;',
          text: post.content
        }
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

