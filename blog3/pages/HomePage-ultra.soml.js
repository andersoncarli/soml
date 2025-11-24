// HomePage - Ultra-concise SOML with space-separated utility classes
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
    // Status bar (fixed top-right)
    'status-bar position-fixed top-0 end-0 m-3': {
      style: 'z-index: 1000',
      'status-badge badge bg-success me-2': '✓ Connected',
      'online-badge badge bg-info': `👥 ${onlineCount}`
    },
    
    // Main container
    'container mt-5': {
      'div bg-white rounded-3 shadow-lg p-4 p-md-5': {
        
        // Header
        'h1 text-center mb-2': '🚂 Blog2',
        'p text-center text-muted mb-5': 'Real-Time Blogging Platform',
        
        // Posts grid  
        'posts-row row': posts.map((post, idx) => ({
          'div col-md-6 mb-4': {
            'data-post-id': post.id,
            
            'div card h-100 shadow': {
              'div card-body': {
                
                'h5 card-title text-primary': post.title,
                
                // Tags
                ...(post.tags?.length > 0 && {
                  'div mb-3': post.tags.map(tag => ({
                    'span badge bg-secondary me-1': `#${tag}`
                  }))
                }),
                
                // Excerpt
                'p card-text text-muted': post.excerpt,
                
                // Footer
                'div d-flex justify-content-between align-items-center mt-3 pt-3 border-top': {
                  'small text-muted': `By ${post.author}`,
                  'div d-flex gap-2': [
                    { 'span badge bg-info': `👁 ${post.viewCount}` },
                    { 'span badge bg-primary': `💬 ${post.commentCount}` }
                  ]
                }
              }
            }
          }
        }))
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
      
      cs.on('connection', () => {
        set('#status', '✓ Connected');
        get('#status').className = 'badge bg-success me-2';
      });
      
      cs.on('disconnect', () => {
        set('#status', '✗ Disconnected');
        get('#status').className = 'badge bg-danger me-2';
      });
      
      cs.on('users:count', (data) => set('#online', `👥 ${data.count}`));
      
      on('#posts.click', (e) => {
        const card = e.target.closest('[data-post-id]');
        if (card) location = '/blog2/posts/' + card.getAttribute('data-post-id');
      });
      
      cs.on('post:created', (post) => {
        // Create post card using pure SOML - no HTML!
        const postCard = {
          div: {
            class: 'col-md-6 mb-4 fade-in',
            'data-post-id': post.id,
            children: [{
              div: {
                class: 'card h-100 shadow',
                children: [{
                  div: {
                    class: 'card-body',
                    children: [
                      { h5: { class: 'card-title text-primary', text: post.title } },
                      { p: { class: 'card-text text-muted', text: post.excerpt } },
                      {
                        div: {
                          class: 'd-flex justify-content-between align-items-center mt-3 pt-3 border-top',
                          children: [
                            { small: { class: 'text-muted', text: `By ${post.author}` } },
                            {
                              div: {
                                class: 'd-flex gap-2',
                                children: [
                                  { span: { class: 'badge bg-info', text: `👁 ${post.viewCount || 0}` } },
                                  { span: { class: 'badge bg-primary', text: `💬 ${post.commentCount || 0}` } }
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
        };
        
        // Convert SOML to DOM and insert
        const posts = get('#posts');
        const postElement = soml(postCard);
        posts.insertBefore(postElement, posts.firstChild);
      });
    }
  }
});

module.exports = HomePage;

