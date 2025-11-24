// HomePage - Clean SOML following apps/todo pattern
const HomePage = ({ posts = [], onlineCount = 0 }) => ({
  head: {
    title: "Blog2 - Real-Time",
    meta: [
      { charset: 'UTF-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1.0' }
    ],
    link: { rel: 'stylesheet', href: 'https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css' },
    style: `
      body { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); min-height: 100vh; }
      .main-container { background: white; border-radius: 15px; padding: 2rem; margin: 2rem auto; box-shadow: 0 10px 40px rgba(0,0,0,0.2); max-width: 1200px; }
      .card { cursor: pointer; transition: all 0.3s; }
      .card:hover { transform: translateY(-5px); }
      .connection-status { position: fixed; top: 20px; right: 20px; z-index: 1000; }
      @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
      .fade-in { animation: fadeIn 0.3s; }
    `
  },
  
  body: [
    // Libraries
    { script: { src: '/centralstation.js' } },
    { script: { src: '/soml-client.js' } },
    
    // Connection status
    { div: {
      id: 'status-bar',
      class: 'connection-status',
      children: [
        { span: { id: 'status', class: 'badge bg-success me-2', text: '✓ Connected' } },
        { span: { id: 'online', class: 'badge bg-info', text: `👥 ${onlineCount}` } }
      ]
    }},
    
    // Main content
    { div: {
      class: 'container mt-5',
      children: [{
        div: {
          class: 'main-container',
          children: [
            { h1: { class: 'text-center mb-4', text: '🚂 Blog2' } },
            { p: { class: 'text-center text-muted mb-5', text: 'Real-Time Blogging' } },
            
            // Posts container
            { div: {
              id: 'posts',
              class: 'row',
              children: posts.map(post => ({
            div: {
              class: 'col-md-6 mb-4',
              'data-post-id': post.id,
              children: [{
                div: {
                  class: 'card shadow-sm',
                  children: [{
                    div: {
                      class: 'card-body',
                      children: [
                        { h5: { class: 'card-title', text: post.title } },
                        post.tags?.length > 0 && {
                          div: {
                            class: 'mb-2',
                            children: post.tags.map(tag => ({
                              span: { class: 'badge bg-secondary me-1', text: `#${tag}` }
                            }))
                          }
                        },
                        { p: { class: 'card-text text-muted', text: post.excerpt } },
                        {
                          div: {
                            class: 'd-flex justify-content-between mt-3',
                            children: [
                              { small: { class: 'text-muted', text: `By ${post.author}` } },
                              {
                                div: {
                                  children: [
                                    { span: { class: 'badge bg-info me-1', text: `👁 ${post.viewCount}` } },
                                    { span: { class: 'badge bg-primary', text: `💬 ${post.commentCount}` } }
                                  ]
                                }
                              }
                            ]
                          }
                        }
                      ].filter(Boolean)
                    }
                  }]
                }
              }]
                }
              }))
            }}
          ]
        }
      }]
    }}
  ],
  
  // Client-side script - actual function like in todo.soml.js!
  script() {
    // WebSocket connection
    const cs = new CentralStation();
    
    // Connection status handlers
    cs.on('connection', () => {
      set('#status', '✓ Connected');
      get('#status').className = 'badge bg-success me-2';
    });
    
    cs.on('disconnect', () => {
      set('#status', '✗ Disconnected');
      get('#status').className = 'badge bg-danger me-2';
    });
    
    // Online users count
    cs.on('users:count', (data) => {
      set('#online', `👥 ${data.count}`);
    });
    
    // Click handling via delegation
    on('#posts.click', (e) => {
      const card = e.target.closest('[data-post-id]');
      if (card) {
        location = '/blog2/posts/' + card.getAttribute('data-post-id');
      }
    });
    
    // New posts in real-time
    cs.on('post:created', (post) => {
      const posts = get('#posts');
      const col = document.createElement('div');
      col.className = 'col-md-6 mb-4 fade-in';
      col.setAttribute('data-post-id', post.id);
      col.innerHTML = `
        <div class="card shadow-sm">
          <div class="card-body">
            <h5 class="card-title">${post.title}</h5>
            <p class="card-text text-muted">${post.excerpt}</p>
            <div class="d-flex justify-content-between mt-3">
              <small class="text-muted">By ${post.author}</small>
              <div>
                <span class="badge bg-info me-1">👁 ${post.viewCount || 0}</span>
                <span class="badge bg-primary">💬 ${post.commentCount || 0}</span>
              </div>
            </div>
          </div>
        </div>
      `;
      posts.insertBefore(col, posts.firstChild);
    });
  }
});

module.exports = HomePage;
