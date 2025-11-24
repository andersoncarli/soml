const pageTemplate = {
  meta: { charset: "UTF-8" },
  title: "My Awesome SOM Page",
  link: [
    { rel: "stylesheet", href: "https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/css/bootstrap.min.css" },
    { rel: "stylesheet", href: "./style.css" }
  ],
  body: {
    div: [
      {
        class: "container", style: "margin-top: 2rem;",
        h1: "Welcome to My Awesome SOM Page with bootstrap",
        p: "This page is built using SOM, a Simple Object Model for creating dynamic HTML pages with JavaScript."
      },
      {
        class: "container",
        form: {
          action: "/submit", method: "POST",
          div: [
            {
              class: "form-group",
              label: { for: "email", text: "Email" },
              input: { type: "email", class: "form-control", id: "email", name: "email", placeholder: "Enter your email" }
            },
            {
              class: "form-group",
              label: { for: "password", text: "Password" },
              input: { type: "password", class: "form-control", id: "password", name: "password", placeholder: "Enter your password" }
            },
            {
              class: "form-group",
              button: { type: "submit", class: "btn btn-primary", text: "Submit" }
            }
          ]
        }
      },
      {
        class: "container",
        p: "Click on the button below to change the background color of this page!",
        button: { id: "change-bg-color", class: "btn btn-secondary", text: "Change background color" }
      }
    ],
    script() {
      on("#change-bg-color.click", () => {
        document.body.style.backgroundColor = randomColor();
      });

      function randomColor() {
        const r = Math.floor(Math.random() * 256);
        const g = Math.floor(Math.random() * 256);
        const b = Math.floor(Math.random() * 256);
        return "rgb(" + r + "," + g + "," + b + ")";
      }
    }
  }
};