// Blog2 Comment Schema - Real-time commenting
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
    // Single comment view
    item: (comment) => ({
      div: {
        class: 'comment-item mb-3 p-3 border rounded bg-light',
        'data-comment-id': comment.id,
        children: [
          {
            div: {
              class: 'd-flex justify-content-between align-items-start mb-2',
              children: [
                {
                  strong: {
                    class: 'text-primary',
                    text: comment.author
                  }
                },
                {
                  small: {
                    class: 'text-muted',
                    text: new Date(comment.createdAt).toLocaleString()
                  }
                }
              ]
            }
          },
          {
            p: {
              class: 'mb-2',
              text: comment.content
            }
          },
          {
            div: {
              class: 'd-flex gap-2',
              children: [
                {
                  button: {
                    class: 'btn btn-sm btn-outline-primary like-btn',
                    'data-comment-id': comment.id,
                    text: `👍 ${comment.likes || 0}`
                  }
                },
                {
                  button: {
                    class: 'btn btn-sm btn-outline-secondary reply-btn',
                    'data-comment-id': comment.id,
                    text: '↩️ Reply'
                  }
                }
              ]
            }
          }
        ]
      }
    }),

    // List of comments
    list: (comments) => ({
      div: {
        id: 'comments-list',
        class: 'comments-list',
        children: comments.length > 0 
          ? comments.map(comment => Comment.views.item(comment))
          : [{
              div: {
                class: 'alert alert-info',
                text: 'No comments yet. Be the first to comment!'
              }
            }]
      }
    }),

    // Comment form
    form: () => ({
      div: {
        class: 'comment-form card shadow-sm',
        children: [{
          div: {
            class: 'card-body',
            children: [
              { h5: { class: 'card-title', text: 'Add a Comment' } },
              {
                form: {
                  id: 'comment-form',
                  children: [
                    {
                      div: {
                        class: 'mb-3',
                        children: [
                          {
                            label: {
                              for: 'comment-author',
                              class: 'form-label',
                              text: 'Your Name'
                            }
                          },
                          {
                            input: {
                              type: 'text',
                              class: 'form-control',
                              id: 'comment-author',
                              placeholder: 'Enter your name',
                              required: true
                            }
                          }
                        ]
                      }
                    },
                    {
                      div: {
                        class: 'mb-3',
                        children: [
                          {
                            label: {
                              for: 'comment-content',
                              class: 'form-label',
                              text: 'Comment'
                            }
                          },
                          {
                            textarea: {
                              class: 'form-control',
                              id: 'comment-content',
                              rows: 3,
                              placeholder: 'Write your comment...',
                              required: true
                            }
                          }
                        ]
                      }
                    },
                    {
                      button: {
                        type: 'submit',
                        class: 'btn btn-primary',
                        text: '💬 Post Comment'
                      }
                    }
                  ]
                }
              }
            ]
          }
        }]
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

