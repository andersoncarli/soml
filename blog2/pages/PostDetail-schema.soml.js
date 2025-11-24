// PostDetail - Using Schema Views (Concise SOML)
const Post = require('../schemas/Post-concise');
const Comment = require('../schemas/Comment-concise');

const PostDetail = ({ post, comments = [], onlineCount = 0 }) => ({
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
      'div bg-white rounded-3 shadow-lg p-4 p-md-5': [
        
        // Breadcrumb
        {
          'nav mb-4': {
            'ol breadcrumb': [
              { 'li breadcrumb-item': { a: { href: '/blog2', text: 'Home' } } },
              { 'li breadcrumb-item active': post.title }
            ]
          }
        },
        
        // Post content - USE SCHEMA VIEW!
        Post.views.detail(post),
        
        // Comments section
        {
          'comments-section mt-5': [
            { 'h3 mb-4': `Comments (${comments.length})` },
            
            // Comment form - USE SCHEMA VIEW!
            Comment.views.form(),
            
            // Comments list - USE SCHEMA VIEW!
            Comment.views.list(comments)
          ]
        }
      ]
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
        const author = get('#comment-author').value.trim();
        const content = get('#comment-content').value.trim();
        
        if (!author || !content) return;
        
        cs.emit('comment:create', { postId, author, content });
        
        // Clear form
        get('#comment-author').value = '';
        get('#comment-content').value = '';
      };
      
      // Form submit handler
      on('#comment-form.submit', (e) => {
        e.preventDefault();
        postComment();
      });
      
      // Real-time comment created - USE SCHEMA VIEW!
      cs.on('comment:created', (comment) => {
        if (comment.postId !== postId) return;
        
        // Get Comment schema from window (injected by server)
        const Comment = window.CommentSchema;
        
        // Convert schema view to DOM element
        const commentElement = soml(Comment.views.item(comment));
        commentElement.classList.add('fade-in');
        
        get('#comments-list').prepend(commentElement);
        
        // Update count
        const countBadge = get('#comment-count-badge');
        const currentCount = parseInt(countBadge.textContent.match(/\d+/)[0]);
        countBadge.textContent = `💬 ${currentCount + 1} comments`;
      });
      
      // Like comment
      window.likeComment = function(commentId) {
        cs.emit('comment:like', { postId, commentId });
      };
      
      // Like button click handlers
      on('#comments-list.click', (e) => {
        const likeBtn = e.target.closest('.like-btn');
        if (likeBtn) {
          const commentId = likeBtn.getAttribute('data-comment-id');
          likeComment(commentId);
        }
      });
      
      // Real-time like update
      cs.on('comment:liked', (data) => {
        const btn = get(`[data-comment-id="${data.id}"].like-btn`);
        if (btn) {
          btn.textContent = `👍 ${data.likes}`;
        }
      });
    }
  }
});

module.exports = PostDetail;

