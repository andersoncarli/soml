// Navbar component
const { soml } = require('../../src/soml');

const Navbar = ({ brand = 'Blog2', links = [] }) => soml({
  nav: {
    class: 'navbar navbar-expand-lg navbar-light bg-white shadow-sm mb-4',
    children: [{
      div: {
        class: 'container',
        children: [
          { 
            a: { 
              class: 'navbar-brand fw-bold text-primary', 
              href: '/blog2', 
              content: '🚂 ' + brand 
            } 
          },
          {
            button: {
              class: 'navbar-toggler',
              type: 'button',
              'data-bs-toggle': 'collapse',
              'data-bs-target': '#navbarNav',
              children: [{ span: { class: 'navbar-toggler-icon' } }]
            }
          },
          {
            div: {
              class: 'collapse navbar-collapse',
              id: 'navbarNav',
              children: [{
                ul: {
                  class: 'navbar-nav ms-auto',
                  children: links.map(link => ({
                    li: {
                      class: 'nav-item',
                      children: [{
                        a: {
                          class: 'nav-link' + (link.active ? ' active' : ''),
                          href: link.href,
                          content: link.content || link.text
                        }
                      }]
                    }
                  }))
                }
              }]
            }
          }
        ]
      }
    }]
  }
});

module.exports = Navbar;

