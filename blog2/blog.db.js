// server/db.js
const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost/blog', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const PostSchema = new mongoose.Schema({
  title: String,
  content: String
});

const Post = mongoose.model('Post', PostSchema);

module.exports = { Post };
