module.exports = Model = {
  // User entity to store user information
  'User': {
    'username': 'string',
    'email': 'string',
    'password': 'string',
    'role': 'string', // e.g., 'admin', 'editor', 'user'
    'bio': 'string',
    'createdAt': 'Date',
    'updatedAt': 'Date',
    'profileImage': 'Image' // Optional, reference to Image entity
  },

  // Post entity for blog posts
  'Post': {
    'title': 'string',
    'content': 'string',
    'excerpt': 'string',
    'authorId': 'User', // Reference to User entity
    'status': 'string', // e.g., 'draft', 'published'
    'tags': ['string'], // Array of tags
    'categories': ['Category'], // Array of Category entities
    'createdAt': 'Date',
    'updatedAt': 'Date',
    'publishedAt': 'Date',
    'featuredImage': 'Image' // Optional, reference to Image entity
  },

  // Comment entity for post comments
  'Comment': {
    'content': 'string',
    'postId': 'Post', // Reference to Post entity
    'authorId': 'User', // Reference to User entity
    'createdAt': 'Date',
    'updatedAt': 'Date'
  },

  // Thread entity for forum-like discussions
  'Thread': {
    'title': 'string',
    'content': 'string',
    'authorId': 'User', // Reference to User entity
    'createdAt': 'Date',
    'updatedAt': 'Date',
    'posts': ['Post'], // Array of Post entities
  },

  // Dashboard entity for user dashboards
  'Dashboard': {
    'userId': 'User', // Reference to User entity
    'widgets': ['Widget'], // Array of Widget entities
    'createdAt': 'Date',
    'updatedAt': 'Date'
  },

  // Category entity for blog post categories
  'Category': {
    'name': 'string',
    'description': 'string',
    'createdAt': 'Date',
    'updatedAt': 'Date'
  },

  // Image entity for media management
  'Image': {
    'url': 'string',
    'altText': 'string',
    'uploadedAt': 'Date'
  },

  // Widget entity for customizable dashboard widgets
  'Widget': {
    'type': 'string', // e.g., 'chart', 'list'
    'data': 'object', // Data specific to the widget type
    'settings': 'object', // Custom settings for the widget
    'createdAt': 'Date',
    'updatedAt': 'Date'
  },

  // Document entity for documentation
  'Document': {
    'title': 'string',
    'content': 'string',
    'authorId': 'User', // Reference to User entity
    'createdAt': 'Date',
    'updatedAt': 'Date'
  },

  // Event entity for tracking system events
  'Event': {
    'type': 'string', // e.g., 'error', 'info', 'warning'
    'message': 'string',
    'timestamp': 'Date',
    'userId': 'User' // Optional, reference to User entity
  },

  // Notification entity for user notifications
  'Notification': {
    'userId': 'User', // Reference to User entity
    'message': 'string',
    'type': 'string', // e.g., 'info', 'warning', 'error'
    'read': 'boolean',
    'createdAt': 'Date',
    'updatedAt': 'Date'
  },

  // Role entity for defining user roles and permissions
  'Role': {
    'name': 'string',
    'permissions': ['string'], // Array of permissions
    'createdAt': 'Date',
    'updatedAt': 'Date'
  },

  // ActivityLog entity for tracking user activities
  'ActivityLog': {
    'userId': 'User', // Reference to User entity
    'action': 'string', // e.g., 'login', 'post_create'
    'timestamp': 'Date',
    'details': 'object' // Additional details about the activity
  }
};