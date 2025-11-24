// CommentItem component - single comment display
const { soml } = require('../../src/soml');

const CommentItem = (comment) => soml({
  div: {
    class: 'comment-item mb-3 p-3 border rounded bg-light',
    'data-comment-id': comment.id,
    children: [
      {
        div: {
          class: 'd-flex justify-content-between align-items-start mb-2',
          children: [
            {
              strong: {
                class: 'text-primary',
                text: comment.author
              }
            },
            {
              small: {
                class: 'text-muted',
                text: new Date(comment.createdAt).toLocaleString()
              }
            }
          ]
        }
      },
      {
        p: {
          class: 'mb-2',
          text: comment.content
        }
      },
      {
        div: {
          class: 'd-flex gap-2',
          children: [
            {
              button: {
                class: 'btn btn-sm btn-outline-primary like-btn',
                'data-comment-id': comment.id,
                text: `👍 ${comment.likes || 0}`
              }
            }
          ]
        }
      }
    ]
  }
});

module.exports = CommentItem;

