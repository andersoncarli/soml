// In-memory data store for Blog2
const store = {
  posts: [
    {
      id: 'post-1',
      title: 'Welcome to Blog2 - Real-Time Blogging',
      content: `This is Blog2, powered by CentralStation! Every interaction happens in real-time.

Try opening this in multiple browser tabs and watch as comments appear instantly across all tabs. No page refresh needed!

Features:
• Real-time comments - See new comments as they're posted
• Live view counters - Track engagement in real-time
• Instant notifications - Get notified of activity
• WebSocket-powered - Efficient, persistent connections
• Component-based - Clean .soml.js files
• Schema-driven - Everything from schemas

This is the future of web applications - truly real-time, truly interactive.

Built with:
- CentralStation (unified HTTP + WebSocket)
- SOML (declarative UI components)
- Express (HTTP server)
- Bootstrap 5 (responsive design)`,
      excerpt: 'Experience real-time blogging with WebSocket-powered updates. See comments and updates instantly!',
      author: 'Admin',
      status: 'published',
      tags: ['welcome', 'real-time', 'websocket'],
      viewCount: 42,
      commentCount: 3,
      createdAt: new Date('2025-01-01'),
      updatedAt: new Date('2025-01-01')
    },
    {
      id: 'post-2',
      title: 'Building with SOML + CentralStation',
      content: `SOML (Simple Object Markup Language) combined with CentralStation creates a powerful development experience.

With SOML, you write UI components as JavaScript objects - no JSX, no templates, just clean code. CentralStation then adds real-time capabilities with a unified HTTP + WebSocket API.

Component-Based Architecture:
Each page and component is a .soml.js file that exports a function. These functions return SOML structures that render to HTML.

Example:
const PostCard = (post) => soml({
  div: {
    class: 'card',
    children: [
      { h5: { text: post.title } },
      { p: { text: post.excerpt } }
    ]
  }
});

The result? Modern, real-time applications that are:
• Fast to build - Declarative syntax
• Easy to understand - No complex build tools
• Truly interactive - Real-time by default
• Scalable - WebSocket efficiency
• Maintainable - Clear component structure

Try commenting below and watch the magic happen!`,
      excerpt: 'Learn how SOML and CentralStation work together to create real-time web applications with clean component architecture.',
      author: 'Dev Team',
      status: 'published',
      tags: ['tutorial', 'soml', 'centralstation', 'components'],
      viewCount: 28,
      commentCount: 1,
      createdAt: new Date('2025-01-02'),
      updatedAt: new Date('2025-01-02')
    }
  ],
  
  comments: {
    'post-1': [
      {
        id: 'comment-1',
        postId: 'post-1',
        author: 'Alice',
        content: 'This is amazing! Real-time updates work perfectly!',
        likes: 5,
        createdAt: new Date('2025-01-01T10:00:00')
      },
      {
        id: 'comment-2',
        postId: 'post-1',
        author: 'Bob',
        content: 'Love the WebSocket integration. So smooth!',
        likes: 3,
        createdAt: new Date('2025-01-01T11:00:00')
      },
      {
        id: 'comment-3',
        postId: 'post-1',
        author: 'Charlie',
        content: 'The component-based approach is really clean. Great architecture!',
        likes: 2,
        createdAt: new Date('2025-01-01T12:00:00')
      }
    ],
    'post-2': [
      {
        id: 'comment-4',
        postId: 'post-2',
        author: 'Diana',
        content: 'Great tutorial! The .soml.js files make everything so organized.',
        likes: 1,
        createdAt: new Date('2025-01-02T09:00:00')
      }
    ]
  },
  
  onlineUsers: new Set()
};

// Public API
module.exports = {
  // Posts
  getPosts: () => store.posts,
  
  getPost: (id) => store.posts.find(p => p.id === id),
  
  incrementViewCount: (postId) => {
    const post = store.posts.find(p => p.id === postId);
    if (post) {
      post.viewCount++;
    }
    return post;
  },
  
  // Comments
  getComments: (postId) => store.comments[postId] || [],
  
  addComment: (postId, data) => {
    const comment = {
      id: `comment-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      postId,
      author: data.author,
      content: data.content,
      likes: 0,
      createdAt: new Date()
    };
    
    if (!store.comments[postId]) {
      store.comments[postId] = [];
    }
    store.comments[postId].push(comment);
    
    // Update post comment count
    const post = store.posts.find(p => p.id === postId);
    if (post) {
      post.commentCount++;
    }
    
    return comment;
  },
  
  likeComment: (postId, commentId) => {
    const comments = store.comments[postId] || [];
    const comment = comments.find(c => c.id === commentId);
    if (comment) {
      comment.likes++;
    }
    return comment;
  },
  
  // Users
  addUser: (userId) => {
    store.onlineUsers.add(userId);
  },
  
  removeUser: (userId) => {
    store.onlineUsers.delete(userId);
  },
  
  getOnlineCount: () => store.onlineUsers.size
};

