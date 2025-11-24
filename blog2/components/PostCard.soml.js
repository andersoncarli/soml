// PostCard component - displays a post in card format
const { soml } = require('../../src/soml');

const PostCard = (post) => soml({
  div: {
    class: 'col-md-6 mb-4',
    'data-post-id': post.id,
    children: [{
      div: {
        class: 'card h-100 shadow-sm hover-shadow',
        children: [{
          div: {
            class: 'card-body',
            children: [
              { 
                h5: { 
                  class: 'card-title', 
                  children: [{
                    a: {
                      href: `/blog2/posts/${post.id}`,
                      class: 'text-decoration-none text-dark',
                      text: post.title
                    }
                  }]
                } 
              },
              post.tags && post.tags.length > 0 ? {
                div: {
                  class: 'mb-2',
                  children: post.tags.map(tag => ({
                    span: {
                      class: 'badge bg-secondary me-1',
                      text: '#' + tag
                    }
                  }))
                }
              } : null,
              { 
                p: { 
                  class: 'card-text text-muted', 
                  text: post.excerpt || (post.content.substring(0, 150) + '...')
                } 
              },
              {
                div: {
                  class: 'd-flex justify-content-between align-items-center mt-3',
                  children: [
                    {
                      small: {
                        class: 'text-muted',
                        text: `By ${post.author} • ${new Date(post.createdAt).toLocaleDateString()}`
                      }
                    },
                    {
                      div: {
                        class: 'd-flex gap-2',
                        children: [
                          {
                            span: {
                              class: 'badge bg-info',
                              text: `👁 ${post.viewCount || 0}`
                            }
                          },
                          {
                            span: {
                              class: 'badge bg-primary',
                              text: `💬 ${post.commentCount || 0}`
                            }
                          }
                        ]
                      }
                    }
                  ]
                }
              }
            ]
          }
        }]
      }
    }]
  }
});

module.exports = PostCard;

