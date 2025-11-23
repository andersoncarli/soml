function soml(nameOrTemplate, templateOrFunc) {
  // Function to check if input is a plain object
  const isPlainObject = (obj) => obj && typeof obj === 'object' && obj.constructor === Object;

  // Default template, if no function is provided
  let template = isPlainObject(nameOrTemplate) ? nameOrTemplate : templateOrFunc || {};

  // If the second argument is a function, use it to create the template
  if (typeof templateOrFunc === 'function') {
    template = (...args) => templateOrFunc(...args);
  }

  // Callable function to allow the SOML element to be called like a function
  function callable(...params) {
    return typeof template === 'function' ? template(...params) : template;
  }

  // Create a Proxy for callable that acts as an array
  return new Proxy(callable, {
    apply(target, thisArg, args) {
      return target(...args); // Calls the template function
    },
    get(target, prop, receiver) {
      // Handle length for arrays, and default object properties
      if (prop === 'length') return Array.isArray(template) ? template.length : 1;
      if (prop === 'keys') return () => Object.keys(template);
      if (prop in target) return target[prop]; // Use callable's own properties

      // Default to template's properties
      return template[prop];
    },
    set(target, prop, value) {
      // Dynamically set properties in the template
      if (Array.isArray(template)) template[prop] = value;
      else template = { ...template, [prop]: value };
      return true;
    },
    has(target, prop) {
      return prop in template || prop in target;
    }
  });
}

// Example usage
module.exports = soml;

test('soml', ({ check, checkFail }) => {
  // Name + template form
  const header1 = soml('Header', { div: 'hello' });
  check(header1.length, 1);
  check(header1[0].div, 'hello');

  // Name + constructor form
  const header2 = soml('Header', (msg) => ({ div: msg }));
  const constructed = header2('Hello SOML');
  check(constructed.div, 'Hello SOML');

  // Template-only form
  const templateOnly = soml({ div: { p: "Hello world!" } });
  check(templateOnly.length, 1);
  check(templateOnly[0].div.p, "Hello world!");

  // Array of children
  const arrayChildren = soml([
    { lang: 'en', p: "Hello world!" },
    { lang: 'pt', p: "Olá Mundo!" }
  ]);
  check(arrayChildren.length, 2);
  check(arrayChildren[0].lang, 'en');
  check(arrayChildren[1].lang, 'pt');

  // Complex page1 structure
  const page1 = soml({
    html: {
      lang: 'en',
      head: { meta: { charset: 'UTF-8', name: 'viewport', content: 'width=device-width, initial-scale=1.0' } },
      title: 'SOML Blog',
      script: () => { },
      body: {
        div: {
          id: 'app',
          p: {
            content: "Hello World",
            style: 'color: blue;',
            onclick: (ev) => alert('Clicked!')
          },
          input1: {
            type: 'text',
            name: 'name',
            onchange: (ev) => console.log('Changed:', ev.target.value)
          },
          input2: {
            type: 'button',
            value: 'OK',
            onclick: (ev) => console.log('Button clicked')
          }
        }
      }
    }
  });

  check(page1.length, 1);
  check(page1[0].html.lang, 'en');
  check(page1[0].html.body.div.id, 'app');
  check(page1[0].html.body.div.input1.type, 'text');
  check(page1[0].html.body.div.p.style, 'color: blue;');

  // Complex page2 structure
  const page = soml({
    html: {
      head: { title: 'Hello World with SOML' },
      body: [
        ["h1", 'Hello World from SOML!'],
        ["p", 'Welcome to the SOML-based app with WebSockets!'],
        ["p", 'Open the console to see real-time messages.'],
      ],
      script: () => { },
    }
  });

  check(page.length, 1);
  check(page[0].html.head.title, 'Hello World with SOML');
  check(page[0].html.body.length, 3);
  check(page[0].html.body[0][0], 'h1');
  check(page[0].html.body[1][0], 'p');
  check(page[0].html.body[1][1], 'Welcome to the SOML-based app with WebSockets!');
});
