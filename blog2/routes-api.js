module.exports = {
  '/api/delete-todo': async (req, res) => {
    const { id } = JSON.parse(req.body);
    await db.collection('todos').deleteOne({ _id: new MongoClient.ObjectID(id) });
    res.writeHead(200);
    res.end();
  }
};