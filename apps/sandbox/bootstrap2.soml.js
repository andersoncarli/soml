// Import required modules
const http = require('http')
const fs = require('fs')

// Define the SOM page template
const page = {
  html: {
    head: {
      meta: { charset: 'UTF-8' },
      title: 'SOM Bootstrap Example',
      link: {
        rel: 'stylesheet',
        href: 'https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0/css/bootstrap.min.css',
        integrity: 'sha384-Gn5384xqQ1aoWXA+058RXPxPg6fy4IWvTNh0E263XmFcJlSAwiGgFAW/dAiS6JXm',
        crossorigin: 'anonymous'
      }
    },
    body: {
      navbar: { class: 'navbar-expand-lg navbar-light bg-light' },
      div: { class: 'container', id: 'main-container' }
    }
  },
  script() {
    // Add click handler to navbar links
    on('.nav-link', (e) => {
      // Prevent link from opening in new page
      e.preventDefault()

      // Get the URL from the link and load content into main container
      const url = e.target.getAttribute('href')
      load(url, '#main-container')
    })

    // Load the default content into the main container
    load('/home', '#main-container')
  }
}

// // Create an HTTP server to serve the SOM page
// http.createServer((req, res) => {
//   // Set the response headers
//   res.setHeader('Content-Type', 'text/html')
//   res.setHeader('Cache-Control', 'no-cache')

//   // Serve the SOM page as the response
//   res.end(`<!DOCTYPE html>\n${convertToDOM(page).outerHTML}`)
// }).listen(3000, () => console.log('Server running on http://localhost:3000/'))

// // Helper function to load content from a URL into an element
// async function load(url, element) {
//   const response = await fetch(url)
//   const html = await response.text()
//   element.innerHTML = html
// }