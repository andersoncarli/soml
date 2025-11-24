const { htmlPage, get, on } = require('soml');

const page = {
  title: "My Page",
  
  body: {
    button: { 
      text: "Click me!",      
      onClick: () => alert("Hello World!")
    }
  },

  script() {
    on("title.click", (e) => 
      alert("Clicked on title!"))
  }
};

const page = htmlPage(page);
document.body.appendChild(page);