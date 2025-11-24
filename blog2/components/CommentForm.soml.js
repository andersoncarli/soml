// CommentForm component
const { soml } = require('../../src/soml');

const CommentForm = () => soml({
  div: {
    class: 'comment-form card shadow-sm',
    children: [{
      div: {
        class: 'card-body',
        children: [
          { h5: { class: 'card-title', text: '💬 Add a Comment' } },
          {
            form: {
              id: 'comment-form',
              children: [
                {
                  div: {
                    class: 'mb-3',
                    children: [
                      {
                        label: {
                          for: 'comment-author',
                          class: 'form-label',
                          text: 'Your Name'
                        }
                      },
                      {
                        input: {
                          type: 'text',
                          class: 'form-control',
                          id: 'comment-author',
                          placeholder: 'Enter your name',
                          required: true
                        }
                      }
                    ]
                  }
                },
                {
                  div: {
                    class: 'mb-3',
                    children: [
                      {
                        label: {
                          for: 'comment-content',
                          class: 'form-label',
                          text: 'Comment'
                        }
                      },
                      {
                        textarea: {
                          class: 'form-control',
                          id: 'comment-content',
                          rows: 3,
                          placeholder: 'Write your comment...',
                          required: true
                        }
                      }
                    ]
                  }
                },
                {
                  button: {
                    type: 'submit',
                    class: 'btn btn-primary',
                    text: '📤 Post Comment'
                  }
                }
              ]
            }
          }
        ]
      }
    }]
  }
});

module.exports = CommentForm;

