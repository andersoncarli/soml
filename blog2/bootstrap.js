// soml components using Bootstrap

const { soml } = require('./soml');

// Header Component
soml('Header', ({ title }) => ({ div: { h1: title } }));

// Footer Component
soml('Footer', () => ({ div: { p: "© 2024 Made with SOML" } }));

// NavBar Component
soml('NavBar', () => ({
  "ul:navbar-nav mr-auto": [
    { "li-0:nav-item": { "a:nav-link": { href: '/', text: 'Home' } } },
    { "li-1:nav-item": { "a:nav-link": { href: '/posts', text: 'Posts' } } },
    { "li-2:nav-item": { "a:nav-link": { href: '/about', text: 'About' } } }
  ]
}));
