// Blog2 Comment Schema - Concise SOML syntax
const { defineSchema } = require('../../src/schema');

const Comment = defineSchema({
  name: 'Comment',

  fields: {
    id: {
      type: 'string',
      primary: true,
      default: () => `comment-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    },
    postId: {
      type: 'string',
      required: true
    },
    author: {
      type: 'string',
      required: true
    },
    content: {
      type: 'string',
      required: true,
      minLength: 1,
      maxLength: 1000
    },
    parentId: {
      type: 'string',
      default: null  // For threaded replies
    },
    likes: {
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
    // Single comment view - CONCISE SOML!
    item: (comment) => ({
      'div comment-item mb-3 p-3 border rounded bg-light': {
        'data-comment-id': comment.id,
        'div d-flex justify-content-between align-items-start mb-2': {
          'strong text-primary': comment.author,
          'small text-muted': new Date(comment.createdAt).toLocaleString()
        },
        'p mb-2': comment.content,
        'div d-flex gap-2': [
          {
            'button-like btn btn-sm btn-outline-primary like-btn': {
              'data-comment-id': comment.id,
              text: `👍 ${comment.likes || 0}`
            }
          },
          {
            'button btn btn-sm btn-outline-secondary reply-btn': {
              'data-comment-id': comment.id,
              text: '↩️ Reply'
            }
          }
        ]
      }
    }),

    // List of comments - CONCISE SOML!
    list: (comments) => ({
      'comments-list': comments.length > 0 
        ? comments.map(comment => Comment.views.item(comment))
        : [{
            'div alert alert-info': 'No comments yet. Be the first to comment!'
          }]
    }),

    // Comment form - CONCISE SOML!
    form: () => ({
      'comment-form card shadow-sm': {
        'div card-body': {
          'h5 card-title': 'Add a Comment',
          form: {
            id: 'comment-form',
            'div mb-3': [
              {
                'label form-label': {
                  for: 'comment-author',
                  text: 'Your Name'
                }
              },
              {
                'input-comment-author form-control': {
                  type: 'text',
                  placeholder: 'Enter your name',
                  required: true
                }
              }
            ],
            'div mb-3': [
              {
                'label form-label': {
                  for: 'comment-content',
                  text: 'Comment'
                }
              },
              {
                'textarea-comment-content form-control': {
                  rows: 3,
                  placeholder: 'Write your comment...',
                  required: true
                }
              }
            ],
            'button btn btn-primary': {
              type: 'submit',
              text: '💬 Post Comment'
            }
          }
        }
      }
    })
  },

  events: {
    'comment:created': (data) => {
      console.log('✓ Comment created on post:', data.postId);
    },
    'comment:liked': (data) => {
      console.log('✓ Comment liked:', data.id);
    },
    'comment:deleted': (data) => {
      console.log('✓ Comment deleted:', data.id);
    }
  }
});

module.exports = Comment;

