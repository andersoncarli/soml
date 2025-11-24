// components/Posts.js
soml('Posts', ({ posts }) => {
  return {
    div: {
      class: 'container',
      h1: 'Posts',
      ...posts.map(post => ({
        div: {
          class: 'post',
          h2: post.title,
          p: post.content
        }
      }))
    }
  };
});
