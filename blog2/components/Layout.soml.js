// Layout component - wraps all pages
const { soml } = require('../../src/soml');

const Layout = ({ title, children, pageScript = null }) => soml({
  html: {
    lang: 'en',
    children: [
      {
        head: {
          children: [
            { meta: { charset: 'UTF-8' } },
            { meta: { name: 'viewport', content: 'width=device-width, initial-scale=1.0' } },
            { title: { content: title } },
            { 
              link: { 
                rel: 'stylesheet', 
                href: 'https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css' 
              } 
            },
            {
              style: {
                content: `
                  body {
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    min-height: 100vh;
                    padding-bottom: 3rem;
                  }
                  .main-container {
                    background: white;
                    border-radius: 15px;
                    padding: 2rem;
                    margin-top: 2rem;
                    box-shadow: 0 10px 40px rgba(0,0,0,0.2);
                  }
                  .hover-shadow {
                    transition: all 0.3s ease;
                  }
                  .hover-shadow:hover {
                    transform: translateY(-5px);
                    box-shadow: 0 8px 25px rgba(0,0,0,0.15);
                  }
                  .post-content {
                    white-space: pre-wrap;
                    line-height: 1.8;
                    font-size: 1.1rem;
                  }
                  @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(-10px); }
                    to { opacity: 1; transform: translateY(0); }
                  }
                  .animate-fade-in {
                    animation: fadeIn 0.3s ease-out;
                  }
                  .connection-status {
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    z-index: 1000;
                  }
                `
              }
            }
          ]
        }
      },
      {
        body: {
          children: [
            children,
            { script: { src: '/centralstation.js' } },
            pageScript ? { script: { src: pageScript } } : null
          ].filter(Boolean)
        }
      }
    ]
  }
});

module.exports = Layout;

