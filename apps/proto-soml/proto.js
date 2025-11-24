return {
  html: {
    meta: { charset: "UTF-8" },
    title: "Proto Player",
    style: "../proto/proto.css",  // same as link: { rel: "stylesheet", href: "proto.css", type: "text/css" },
    script: "dom.js", // same as  script: { src: "./dom.js" },
    template: "splitter.js",

    body: {
      header: {
        title: this.title, // same as div: { class: "title", text: "header" },
        menu: { // same as div:{ class: "menu", text: '☰', style:"font-size: 16px;'} },
          text: '☰',
          'font-size': '16px',
          onClick() {
            get("#nav").classList.toggle('navUp')
          }
        }
      },

      main: [
        { overflow: 'hidden'}, // the style can be defined as string or object.
        { div: { id: "nav", text: "nav" }},
        { splitter: { width: 4 }}, // splitter is a webcomponent
        { div: { text: "article" }},
        { splitter: { width: 4 }},
        { div: { text: "aside" }}
      ],

      footer: "footer"
    },

    script() {
      window.addEventListener('resize', e => {
        if (window.innerWidth > 600)
          get("#nav").classList.remove('navUp')
      })

      on('li.click', e => {
        url = e.target.getAttribute('ref')
        load(url, 'article') // same as get('article').load(url)
        get("#nav").classList.remove('navUp')
      })

      async function loadTemplate(url) {
        const response = await fetch(url)
        const html = await response.text()
        const template = document.createElement('template')
        template.innerHTML = html
        return template
      }

      async function insertTemplate(url, element) {
        const template = await loadTemplate(url)
        element.appendChild(template.content.cloneNode(true))
      }
    }
  }
}