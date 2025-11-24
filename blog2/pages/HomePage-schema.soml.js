// HomePage - Using Schema Views (Concise SOML)
const Post = require('../schemas/Post-concise');

const HomePage = ({ posts = [], onlineCount = 0 }) => ({
  head: {
    title: "Blog2 - Real-Time",
    meta: [
      { charset: 'UTF-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1.0' }
    ],
    link: { rel: 'stylesheet', href: 'https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css' },
    link: { rel: 'stylesheet', href: '/styles/app.css' }
  },
  
  body: { 
    // Status bar
    'div position-fixed top-0 end-0 m-3': {
      style: 'z-index: 1000',
      'span-status badge bg-success me-2': '✓ Connected',
      'span-online badge bg-info': `👥 ${onlineCount}`
    },
    
    // Main container
    'div container mt-5': {
      'div bg-white rounded-3 shadow-lg p-4 p-md-5': {
        
        // Header
        'h1 text-center mb-2': '🚂 Blog2',
        'p text-center text-muted mb-5': 'Real-Time Blogging Platform',
        
        // Posts grid - USE SCHEMA VIEW!
        'div-posts row': Post.views.list(posts)
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
      
      // Connection status
      cs.on('connection', () => {
        set('#status', '✓ Connected');
        get('#status').className = 'badge bg-success me-2';
      });
      
      cs.on('disconnect', () => {
        set('#status', '✗ Disconnected');
        get('#status').className = 'badge bg-danger me-2';
      });
      
      // Online users count
      cs.on('users:count', (data) => set('#online', `👥 ${data.count}`));
      
      // Click handling via event delegation
      on('#posts-grid.click', (e) => {
        const card = e.target.closest('[data-post-id]');
        if (card) location = '/blog2/posts/' + card.getAttribute('data-post-id');
      });
      
      // Real-time new posts - USE SCHEMA VIEW!
      cs.on('post:created', (post) => {
        // Get Post schema from window (injected by server)
        const Post = window.PostSchema;
        
        // Convert schema view to DOM element
        const cardElement = soml(Post.views.card(post));
        cardElement.classList.add('fade-in');
        
        get('#posts-grid').prepend(cardElement);
      });
    }
  }
});

module.exports = HomePage;

