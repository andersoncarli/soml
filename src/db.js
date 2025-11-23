// db.js
const { MongoClient } = require('mongodb');

const db = {
  connect: async () => {
    const client = await MongoClient.connect('mongodb://localhost:27017');
    return client.db('soml-blog');
  },

  collections: require('./model.js')// { users: 'users', posts: 'posts', tasks: 'tasks' }
};

module.exports = { db };