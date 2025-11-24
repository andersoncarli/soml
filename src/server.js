// server.js
const express = require('express');
const jwt = require('jsonwebtoken');
const { db } = require('./db');
const app = express();

// JSON Web Token Secret
const secret = 'your_secret_key';

// Middleware
app.use(express.json());
// app.use(require('./middleware/i18n'));

// Routes
app.use('/api', require('./routes/api'));
app.use('/', require('./routes/client.js'));

// Start the server
app.listen(3000, () => {
  console.log('Server started on port 3000');
});