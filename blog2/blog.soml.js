// components/soml-components.js
const soml = require('../utils/soml-utils');

function soml(name, renderFunction) {
  return (props) => {
    const component = soml({ [name]: renderFunction(props) });
    return component;
  };
}

// Bootstrap-based components
soml('Container', (props) => ({ div: { class: 'container', ...props } }));
soml('Row', (props) => ({ div: { class: 'row', ...props } }));
soml('Col', (props) => ({ div: { class: `col${props.size ? '-' + props.size : ''}`, ...props } }));

soml('Button', (props) => ({
  button: {
    class: `btn btn-${props.variant || 'primary'}`,
    ...props
  }
}));

soml('Footer', () => ({
  footer: {
    class: 'footer',
    p: { text: '© 2024 Made with SOML' }
  }
}));

soml('Navbar', () => ({
  nav: {
    class: 'navbar navbar-expand-lg navbar-light bg-light',
    div: [
      { class: 'container' },
      { a: { href: '/', class: 'navbar-brand', text: 'SOML Blog' } },
      { div: {
          class: 'collapse navbar-collapse',
          ul: [
            { class: 'navbar-nav mr-auto' },
            { li: { class: 'nav-item', a: { href: '/', class: 'nav-link', text: 'Home' } } },
            { li: { class: 'nav-item', a: { href: '/posts', class: 'nav-link', text: 'Posts' } } },
            { 'li:nav-item': { a: { 'href:nav-link': '/about', text: 'About' } } }
          ]
        }
      },
      { Button: {
          text: 'Switch Theme',
          onclick: () => {
            document.body.classList.toggle('dark-theme');
          }
        }
      }
    ]
  }
}));

