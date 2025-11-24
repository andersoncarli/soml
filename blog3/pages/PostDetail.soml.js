// PostDetailPage - Ultra-concise SOML with real-time comments
const PostDetail = ({ post, comments, onlineCount }) => ({
  head: {
    title: `${post.title} - Blog2`,
    meta: [
      { charset: 'UTF-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1.0' }
    ],
    link: { rel: 'stylesheet', href: 'https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css' },
    link: { rel: 'stylesheet', href: '/styles/app.css' }
  },
  
  body: {
    // Status bar
    'status-bar position-fixed top-0 end-0 m-3': {
      style: 'z-index: 1000',
      'status-badge badge bg-success me-2': '✓ Connected',
      'online-badge badge bg-info': `👥 ${onlineCount}`
    },
    
    // Main container
    'container mt-5': {
      'div bg-white rounded-3 shadow-lg p-4 p-md-5': {
        
        // Breadcrumb
        'nav mb-4': {
          'ol breadcrumb': [
            { 'li breadcrumb-item': { a: { href: '/blog2', text: 'Home' } } },
            { 'li breadcrumb-item active': post.title }
          ]
        },
        
        // Post Header
        'article-header mb-4 pb-4 border-bottom': {
          'h1 display-5 mb-3': post.title,
          'div d-flex justify-content-between align-items-center': {
            'div': {
              'span me-3': {
                'i me-1': '👤',
                text: post.author
              },
              'span me-3': {
                'i me-1': '📅',
                text: new Date(post.createdAt).toLocaleDateString()
              }
            },
            'div': [
              { 'span badge bg-info me-2': `👁 ${post.viewCount}` },
              { 'span-comment-count badge bg-primary': `💬 ${comments.length}` }
            ]
          },
          ...(post.tags?.length > 0 && {
            'div mt-3': post.tags.map(tag => ({
              'span badge bg-secondary me-1': `#${tag}`
            }))
          })
        },
        
        // Post Content
        'article-content mb-5': {
          'p lead': post.excerpt,
          'div post-content': { style: 'white-space: pre-wrap', text: post.content }
        },
        
        // Comments Section
        'comments-section': {
          'h3 mb-4': `Comments (${comments.length})`,
          
          // Comment Form
          'comment-form card mb-4': {
            'div card-body': {
              'h5 card-title mb-3': 'Add a Comment',
              form: {
                onSubmit: '(e) => { e.preventDefault(); postComment(); }',
                'div mb-3': {
                  'label form-label': { for: 'author', text: 'Name' },
                  'input-author form-control': {
                    type: 'text',
                    placeholder: 'Your name',
                    required: true
                  }
                },
                'div mb-3': {
                  'label form-label': { for: 'content', text: 'Comment' },
                  'textarea-content form-control': {
                    rows: 3,
                    placeholder: 'Your comment...',
                    required: true
                  }
                },
                'button-submit btn btn-primary': {
                  type: 'submit',
                  text: '💬 Post Comment'
                }
              }
            }
          },
          
          // Comments List
          'comments-list': comments.map(comment => ({
            [`comment-${comment.id} border-bottom pb-3 mb-3`]: {
              'div d-flex justify-content-between mb-2': {
                'strong': comment.author,
                'small text-muted': new Date(comment.createdAt).toLocaleString()
              },
              'p mb-2': comment.content,
              'button-like btn btn-sm btn-outline-primary': {
                'data-comment-id': comment.id,
                text: `👍 ${comment.likes}`
              }
            }
          }))
        }
      }
    },
    
    // Scripts
    script: [
      { src: '/centralstation.js' },
      { src: '/soml-client.js' }
    ],
    
    // Client-side real-time logic
    script() {
      const cs = new CentralStation();
      const postId = window.location.pathname.split('/').pop();
      
      // Connection status
      cs.on('connection', () => {
        set('#status', '✓ Connected');
        get('#status').className = 'badge bg-success me-2';
      });
      
      cs.on('disconnect', () => {
        set('#status', '✗ Disconnected');
        get('#status').className = 'badge bg-danger me-2';
      });
      
      // Online users
      cs.on('users:count', (data) => set('#online', `👥 ${data.count}`));
      
      // Post comment function
      window.postComment = function() {
        const author = get('#author').value.trim();
        const content = get('#content').value.trim();
        
        if (!author || !content) return;
        
        cs.emit('comment:create', { postId, author, content });
        
        // Clear form
        get('#author').value = '';
        get('#content').value = '';
      };
      
      // Real-time comment created
      cs.on('comment:created', (comment) => {
        if (comment.postId !== postId) return;
        
        // Create comment using pure SOML
        const commentEl = soml({
          [`comment-${comment.id} border-bottom pb-3 mb-3 fade-in`]: {
            'div d-flex justify-content-between mb-2': {
              'strong': comment.author,
              'small text-muted': new Date(comment.createdAt).toLocaleString()
            },
            'p mb-2': comment.content,
            'button-like btn btn-sm btn-outline-primary': {
              'data-comment-id': comment.id,
              onclick: () => likeComment(comment.id),
              text: `👍 ${comment.likes}`
            }
          }
        });
        
        get('#comments-list').prepend(commentEl);
        
        // Update count
        const currentCount = parseInt(get('#comment-count').textContent.match(/\d+/)[0]);
        set('#comment-count', `💬 ${currentCount + 1}`);
      });
      
      // Like comment
      window.likeComment = function(commentId) {
        cs.emit('comment:like', { postId, commentId });
      };
      
      // Like button click handlers
      on('#comments-list.click', (e) => {
        if (e.target.matches('[data-comment-id]')) {
          const commentId = e.target.getAttribute('data-comment-id');
          likeComment(commentId);
        }
      });
      
      // Real-time like update
      cs.on('comment:liked', (data) => {
        const btn = get(`[data-comment-id="${data.id}"]`);
        if (btn) {
          btn.textContent = `👍 ${data.likes}`;
        }
      });
    }
  }
});

module.exports = PostDetail;

