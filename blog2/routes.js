module.exports = {
  '/': (req, res) => {
    renderPage('Home', req, res);
  },
  '/posts': async (req, res) => {
    const posts = await db.collection('posts').find().toArray();
    renderPage('Posts', req, res, { posts });
  },
  '/about': (req, res) => {
    renderPage('About', req, res);
  },
  '/static': (req, res) => {
    const filePath = path.join(__dirname, 'static', url.parse(req.url).pathname);
    fs.readFile(filePath, (err, data) => {
      if (err) {
        res.writeHead(404);
        res.end('File not found');
        return;
      }
      res.writeHead(200, { 'Content-Type': mime.getType(filePath) });
      res.end(data);
    });
  },
  '/todos': async (req, res) => {
    renderPage('ToDo', req, res);
  },
};