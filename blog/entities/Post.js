/ model/Post.js

const marked = require('marked');
const sanitizeHtml = require('sanitize-html');

type("Post:Schema", {
  fields: {
    id: { type: 'string', required: true },
    title: { type: 'string', required: true },
    content: { type: 'string', required: true },
    excerpt: { type: 'string' },
    authorId: { type: 'string', required: true },
    status: { type: 'string', enum: ['draft', 'published'], default: 'draft' },
    tags: { type: 'array', items: { type: 'string' } },
    categories: { type: 'array', items: { type: 'string' } },
    createdAt: { type: 'date', default: Date.now },
    updatedAt: { type: 'date', default: Date.now },
    publishedAt: { type: 'date' },
    featuredImage: { type: 'string' }
  },

  routes: {
    '/posts': { get: 'list', post: 'create' },
    '/posts/:id': { get: 'detail', put: 'update', delete: 'delete' },
    '/posts/:id/comments': { get: 'postComments', post: 'addComment' },
    '/posts/search': { get: 'search' },
    '/posts/categories/:category': { get: 'postsByCategory' },
    '/posts/tags/:tag': { get: 'postsByTag' }
  },

  views: {
    list: () => soml({
      div: {
        class: 'post-list', children: [
          {
            article: {
              class: 'post-item', children: [
                { img: { class: 'featured-image', src: '${post.featuredImage}', alt: '${post.title}' } },
                {
                  h2: {
                    class: 'post-title', children: [
                      { a: { href: '/posts/${post.id}', content: '${post.title}' } }
                    ]
                  }
                },
                { p: { class: 'post-excerpt', content: '${post.excerpt}' } },
                {
                  div: {
                    class: 'post-meta', children: [
                      { span: { class: 'author', content: 'By ${post.author.username}' } },
                      { span: { class: 'date', content: '${new Date(post.publishedAt).toLocaleDateString()}' } },
                      { span: { class: 'tags', content: '${post.tags.join(", ")}' } }
                    ]
                  }
                }
              ]
            }
          }
        ]
      }
    }),
    detail: (post) => soml({
      article: {
        class: 'post-detail', children: [
          { h1: { class: 'post-title', content: post.title } },
          {
            div: {
              class: 'post-meta', children: [
                { span: { class: 'author', content: `By ${post.author.username}` } },
                { span: { class: 'date', content: new Date(post.publishedAt).toLocaleDateString() } },
                { span: { class: 'categories', content: post.categories.join(', ') } },
                { span: { class: 'tags', content: post.tags.join(', ') } }
              ]
            }
          },
          { img: { class: 'featured-image', src: post.featuredImage, alt: post.title } },
          { div: { class: 'post-content', content: marked(post.content) } }
        ]
      }
    }),
    editor: (post = {}) => soml({
      form: {
        class: 'post-editor', action: post.id ? `/posts/${post.id}` : '/posts', method: 'POST', children: [
          { input: { type: 'text', name: 'title', value: post.title, placeholder: 'Post Title' } },
          { textarea: { name: 'content', placeholder: 'Post Content', content: post.content } },
          { input: { type: 'text', name: 'tags', value: post.tags?.join(', '), placeholder: 'Tags (comma-separated)' } },
          {
            select: {
              name: 'category', children: [
                { option: { value: '', content: 'Select Category' } },
                // Populate with actual categories
              ]
            }
          },
          { input: { type: 'file', name: 'featuredImage', accept: 'image/*' } },
          {
            select: {
              name: 'status', children: [
                { option: { value: 'draft', content: 'Draft' } },
                { option: { value: 'published', content: 'Published' } }
              ]
            }
          },
          { button: { type: 'submit', content: post.id ? 'Update Post' : 'Create Post' } }
        ]
      }
    })
  },

  api: {
    list: async (req, res) => {
      const { page = 1, limit = 10, status = 'published' } = req.query;
      const posts = await Post.db.find({ status }, { content: 0 })
        .sort({ publishedAt: -1 })
        .skip((page - 1) * limit)
        .limit(Number(limit));
      const total = await Post.db.countDocuments({ status });
      res.json({
        posts,
        currentPage: Number(page),
        totalPages: Math.ceil(total / limit),
        totalPosts: total
      });
    },
    create: async (req, res) => {
      const newPost = await Post.db.create({ ...req.body, authorId: req.user.id });
      res.status(201).json(newPost);
    },
    detail: async (req, res) => {
      const post = await Post.db.findOne({ id: req.params.id }).populate('authorId', 'username');
      if (!post) return res.status(404).json({ error: 'Post not found' });
      res.json(post);
    },
    update: async (req, res) => {
      const updatedPost = await Post.db.findOneAndUpdate(
        { id: req.params.id, authorId: req.user.id },
        { ...req.body, updatedAt: Date.now() },
        { new: true }
      );
      if (!updatedPost) return res.status(404).json({ error: 'Post not found or unauthorized' });
      res.json(updatedPost);
    },
    delete: async (req, res) => {
      const result = await Post.db.deleteOne({ id: req.params.id, authorId: req.user.id });
      if (result.deletedCount === 0) return res.status(404).json({ error: 'Post not found or unauthorized' });
      res.status(204).end();
    },
    search: async (req, res) => {
      const { query, page = 1, limit = 10 } = req.query;
      const posts = await Post.db.find(
        { $text: { $search: query }, status: 'published' },
        { score: { $meta: 'textScore' } }
      )
        .sort({ score: { $meta: 'textScore' } })
        .skip((page - 1) * limit)
        .limit(Number(limit));
      res.json(posts);
    },
    postsByCategory: async (req, res) => {
      const { category } = req.params;
      const posts = await Post.db.find({ categories: category, status: 'published' });
      res.json(posts);
    },
    postsByTag: async (req, res) => {
      const { tag } = req.params;
      const posts = await Post.db.find({ tags: tag, status: 'published' });
      res.json(posts);
    },
    postComments: async (req, res) => {
      const comments = await Comment.db.find({ postId: req.params.id }).sort({ createdAt: -1 });
      res.json(comments);
    },
    addComment: async (req, res) => {
      const newComment = await Comment.db.create({
        ...req.body,
        postId: req.params.id,
        authorId: req.user.id
      })
    }
  }
}

module.exports = Post