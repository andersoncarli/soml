const { html, get, on } = require('soml')

// isomorphic with html
const Hello = {
  title: "Hello SOML!",
  body: {
    h1: this.title.text,
    button: {
      text: 'Click me',
      onclick() { alert("Hello World!") }
    },
    p: 'Lorem ipsum dolor sit amet.',
  },
  script(props) {
    const handler = (e) => alert("Clicked on title!")
    on("title.click", handler)
  }
}
var page = html(Hello)
document.body.appendChild(page)


// isomorphic with React
function hello({ title } = props) {
  const r = {
    title, //a destructured variable becomes a element transparently
    body: {
      h1: title, // the component has acces to the closure
      button: {
        text: 'Click me',
        onclick() { alert(`Hello ${this.title}`) } // and the object
      },
    }
  }
  on("title.click", () => alert("Clicked on title!"))
  return r
}
page = html(hello({ title: 'Functional SOML' }))
document.body.appendChild(page)