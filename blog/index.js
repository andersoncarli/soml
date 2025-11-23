// app.soml.js
import { soml, G } from 'soml';

soml('App', [
  'Header',
  { main: ['Home', 'Blog', 'Post', 'Tasks'] },
  'Footer'
]);

soml('Home', {
  h1: 'Welcome to the SOML Blog',
  p: 'Discover the latest articles and insights.',
  a: { href: '/blog', text: 'Read More' }
});

soml('Blog', (posts) => [
  { h2: 'Latest Blog Posts' },
  { ul: { class: 'space-y-4' } },
  ...posts.map(post => ({ BlogPost: { post } }))
]);

soml('Post', (post) => ({
  h1: post.title,
  'div.prose': post.content
}));
// , () => ({ currentPost: G.getPost(G.route.params.slug) })

soml('Tasks', (tasks = []) => {
  return {
    'h2': { text: 'To-Do List' },
    'ul.space-y-2': tasks.map(task => ({
      li: [
        { input: { type: 'checkbox', checked: task.completed } },
        { span: { class: task.completed ? 'line-through text-gray-500' : '', text: task.title } },
        { button: { onclick: () => { task.done = true }, class: 'text-red-500' }, text: '✕' }
      ]
    })),

    'div.mt-4': {
      input: { type: 'text', placeholder: 'New Task', bind: 'newTaskTitle' },
      button: { onclick: G.addTask, class: 'bg-primary hover:bg-blue-700 text-white font-bold py-2 px-4 rounded' }, text: 'Add'
    }
  }
});

soml('BlogPost', (post) => ({
  div: [
    { h3: { text: post.title } },
    { p: { text: post.excerpt } },
    { a: { href: `/posts/${post.slug}`, text: 'Read More' } }
  ]
}));

// central-station.js

export default {
  render: () => soml('App').html(),
  api: G.api
};