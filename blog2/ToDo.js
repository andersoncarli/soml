// components/ToDo.js
const { db } = require('./db'); // Assume you have a module to interact with MongoDB

soml('ToDo', async () => {
  const todos = await db.collection('todos').find().toArray();
  return {
    div: {
      class: 'container',
      h1: 'To-Do List',
      ul: todos.map(todo => ({
        li: {
          class: 'todo-item',
          span: todo.text,
          button: { class: 'btn btn-danger btn-sm', text: 'Delete', onclick: `deleteTodo(${todo._id})` }
        }
      })),
      script: `
        function deleteTodo(id) {
          fetch('/api/delete-todo', { method: 'POST', body: JSON.stringify({ id }) })
            .then(() => location.reload());
        }
      `
    }
  };
});
