// model/User.js

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

type("User:Schema", {
  fields: {
    id: { type: 'string', required: true },
    username: { type: 'string', required: true, unique: true },
    email: { type: 'string', required: true, unique: true },
    password: { type: 'string', required: true, private: true },
    firstName: { type: 'string' },
    lastName: { type: 'string' },
    bio: { type: 'string' },
    avatar: { type: 'string' },
    role: { type: 'string', enum: ['user', 'admin'], default: 'user' },
    createdAt: { type: 'date', default: Date.now },
    updatedAt: { type: 'date', default: Date.now }
  },

  routes: {
    '/users': { get: 'list', post: 'create' },
    '/users/:id': { get: 'detail', put: 'update', delete: 'delete' },
    '/users/:id/posts': { get: 'userPosts' },
    '/login': { post: 'login' },
    '/register': { post: 'register' },
    '/profile': { get: 'profile', put: 'updateProfile' }
  },

  views: {
    list: () => soml({
      ul: { class: 'user-list', children: [
        { li: { class: 'user-item', children: [
          { img: { src: '${user.avatar}', alt: '${user.username}' } },
          { span: { class: 'username', content: '${user.username}' } },
          { span: { class: 'email', content: '${user.email}' } }
        ] } }
      ] }
    }),
    detail: (user) => soml({
      div: { class: 'user-detail', children: [
        { img: { src: user.avatar, alt: user.username } },
        { h2: { content: `${user.firstName} ${user.lastName}` } },
        { p: { class: 'username', content: `@${user.username}` } },
        { p: { class: 'email', content: user.email } },
        { p: { class: 'bio', content: user.bio } },
        { p: { class: 'member-since', content: `Member since: ${new Date(user.createdAt).toLocaleDateString()}` } }
      ] }
    }),
    profile: (user) => soml({
      form: { class: 'profile-form', action: '/profile', method: 'POST', children: [
        { input: { type: 'text', name: 'firstName', value: user.firstName, placeholder: 'First Name' } },
        { input: { type: 'text', name: 'lastName', value: user.lastName, placeholder: 'Last Name' } },
        { input: { type: 'email', name: 'email', value: user.email, placeholder: 'Email' } },
        { textarea: { name: 'bio', placeholder: 'Bio', content: user.bio } },
        { input: { type: 'file', name: 'avatar', accept: 'image/*' } },
        { button: { type: 'submit', content: 'Update Profile' } }
      ] }
    })
  },

  api: {
    list: async (req, res) => {
      const users = await User.db.find({}, { password: 0 });
      res.json(users);
    },
    create: async (req, res) => {
      const newUser = await User.db.create(req.body);
      res.status(201).json(newUser);
    },
    detail: async (req, res) => {
      const user = await User.db.findOne({ id: req.params.id }, { password: 0 });
      if (!user) return res.status(404).json({ error: 'User not found' });
      res.json(user);
    },
    update: async (req, res) => {
      const updatedUser = await User.db.findOneAndUpdate({ id: req.params.id }, req.body, { new: true });
      res.json(updatedUser);
    },
    delete: async (req, res) => {
      await User.db.deleteOne({ id: req.params.id });
      res.status(204).end();
    },
    login: async (req, res) => {
      const { username, password } = req.body;
      const user = await User.db.findOne({ username });
      if (!user || !await bcrypt.compare(password, user.password)) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }
      const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1d' });
      res.json({ token });
    },
    register: async (req, res) => {
      const { username, email, password } = req.body;
      const hashedPassword = await bcrypt.hash(password, 10);
      const newUser = await User.db.create({ ...req.body, password: hashedPassword });
      res.status(201).json(newUser);
    },
    profile: async (req, res) => {
      const user = await User.db.findOne({ id: req.user.id }, { password: 0 });
      res.json(user);
    },
    updateProfile: async (req, res) => {
      const updatedUser = await User.db.findOneAndUpdate({ id: req.user.id }, req.body, { new: true });
      res.json(updatedUser);
    },
    userPosts: async (req, res) => {
      const posts = await Post.db.find({ authorId: req.params.id });
      res.json(posts);
    }
  },

  db: {
    async find(query, projection) {
      // Implementation depends on your database choice
    },
    async findOne(query, projection) {
      // Implementation depends on your database choice
    },
    async create(data) {
      // Implementation depends on your database choice
    },
    async findOneAndUpdate(query, update, options) {
      // Implementation depends on your database choice
    },
    async deleteOne(query) {
      // Implementation depends on your database choice
    }
  },

  // Middleware
  middleware: {
    authenticate: async (req, res, next) => {
      const token = req.headers.authorization?.split(' ')[1];
      if (!token) return res.status(401).json({ error: 'No token provided' });
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = await User.db.findOne({ id: decoded.id }, { password: 0 });
        next();
      } catch (error) {
        res.status(401).json({ error: 'Invalid token' });
      }
    },
    isAdmin: (req, res, next) => {
      if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admin access required' });
      next();
    }
  }
})

module.exports = User;
