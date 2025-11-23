const test = require('node:test');

function toSource(v) {
  if (v === undefined) return 'undefined'
  let s = JSON.stringify(v) || ''
  return s.replace(/"([a-zA-Z_$][a-zA-Z_$0-9]*)":/gm, '$1:')
}
const assert = require('node:assert');

function check(a, b, message) {
  if (typeof a !== 'string') a = toSource(a)
  if (typeof b !== 'string') b = toSource(b)
  console.log(a, b, message)
  assert.equal(a, b, message)
}

// Example usage of the enhanced parseTag function
test('parseTag', () => {
  const { soml, parseTag } = require('./soml.js');

  check(parseTag('p'), '{p:{id:0}}')
  check(parseTag('p0'), '{p:{id:0}}')
  check(parseTag('p1'), '{p:{id:1}}')
  check(parseTag('p-1'), '{p:{id:1}}')
  check(parseTag('h1'), '{h1:{id:0}}')
  check(parseTag('h51'), '{h5:{id:1}}')
  check(parseTag('h61'), '{h6:{id:1}}')
  check(parseTag('h6-2'), '{h6:{id:2}}')
  check(parseTag('h6-id'), '{h6:{id:"id"}}')
  check(parseTag('p-id'), '{p:{id:"id"}}')
  check(parseTag('p.my-class'), '{p:{id:0,class:["my-class"]}}')
  check(parseTag('p-123.my-class'), '{p:{id:123,class:["my-class"]}}')
  check(parseTag('p-123.abc.def'), '{p:{id:123,class:["abc","def"]}}')
  check(parseTag('div-42.my-class.another-class'), '{div:{id:42,class:["my-class","another-class"]}}')
})

// const { soml } = require();
/// Example usage
test('soml-tag', () => {
  const { soml } = require('./soml.js');
  const result = soml('div-1.card.primary', { h1: 'Hello World' }, [1, 2, 3], () => 'p.text-muted');
  console.dir(result);
  check(result, [
    { div: { id: 1, class: ['card', 'primary'] } },
    { h1: 'Hello World' },
    [{ value: 1 }, { value: 2 }, { value: 3 }],
    { p: { id: 0, class: ['text-muted'] } }
  ])
})

test('soml-to', () => {
  const { soml } = require('./soml.js');
  // Example of conversion
  const somlObject = { div: { id: 1, class: ['card'] } };
  let htmlString = soml.toHtml(somlObject);
  check(soml.html?.to(somlObject), htmlString);
  console.log(htmlString); // Assuming `to` plugin implementation for HTML
})

// Test suite for soml functions
test.skip('soml', () => {
  const { soml } = require('./soml.js');
  // Test SOML Object Format
  const somlObj = {
    html: {
      lang: 'en',
      head: {
        title: 'Login Page',
        meta: { charset: 'UTF-8' }
      },
      body: {
        'form-1': {
          action: '/login',
          method: 'post',
          children: [
            { label: { for: 'username', text: 'Username:' } },
            { input: { id: 'username', type: 'text', name: 'username' } },
            { label: { for: 'password', text: 'Password:' } },
            { input: { id: 'password', type: 'password', name: 'password' } },
            { button: { type: 'submit', text: 'Login' } }
          ]
        }
      }
    }
  };

  // Test SOML Array Format [tag, props, constructor, children]
  const somlArray = [
    'html',
    { lang: 'en' },
    [
      ['head', {}, [
        ['title', {}, 'Login Page'],
        ['meta', { charset: 'UTF-8' }]
      ]],
      ['body', {}, [
        ['form', { id: 'form-1', action: '/login', method: 'post' }, [
          ['label', { for: 'username' }, 'Username:'],
          ['input', { id: 'username', type: 'text', name: 'username' }],
          ['label', { for: 'password' }, 'Password:'],
          ['input', { id: 'password', type: 'password', name: 'password' }],
          ['button', { type: 'submit' }, 'Login']
        ]]
      ]]
    ]
  ];

  // Test SOML Function Format
  const somlFunction = () => ({
    html: {
      lang: 'en',
      head: {
        title: 'Login Page',
        meta: { charset: 'UTF-8' }
      },
      body: {
        'form-1': {
          action: '/login',
          method: 'post',
          children: [
            { label: { for: 'username', text: 'Username:' } },
            { input: { id: 'username', type: 'text', name: 'username' } },
            { label: { for: 'password', text: 'Password:' } },
            { input: { id: 'password', type: 'password', name: 'password' } },
            { button: { type: 'submit', text: 'Login' } }
          ]
        }
      }
    }
  });

  // Convert to different formats
  const htmlString = '<html lang="en"><head><title>Login Page</title><meta charset="UTF-8"></head><body><form id="form-1" action="/login" method="post"><label for="username">Username:</label><input id="username" type="text" name="username"><label for="password">Password:</label><input id="password" type="password" name="password"><button type="submit">Login</button></form></body></html>';
  const domElement = new DOMParser().parseFromString(htmlString, 'text/html').documentElement;

  // Tests for soml function
  check(soml(somlObj), somlObj);
  check(soml(somlArray), somlObj);
  check(soml(somlFunction()), somlObj);
  check(soml.toHtml(somlObj), htmlString);
  check(soml.toDom(somlObj).outerHTML, htmlString);
  check(soml.toObj(somlObj), somlObj);
  check(soml.toArray(somlObj), somlArray);
  check(soml.fromHtml(htmlString), somlObj);
  check(soml.fromDom(domElement), somlObj);

  // Test invalid inputs
  check(soml(null), 'null');
  check(soml(undefined), 'undefined');
  check(soml(() => { }, 'undefined'));
  check(soml(() => ({}), '{}'));
  check(soml([]), '[]');
  check(soml(1), { value: 1 });
  check(soml(''), { value: '' });
  checkException(soml(() => { throw new Error('Test exception'); }));
});


// Define a function to run the test matrix
test('soml-Matrix', () => {
  const { soml } = require('./soml.js');
  const testCases = {
    'function': {
      input: () => ({ div: { id: 1, class: ['card'] } }),
      expected: { div: { id: 1, class: ['card'] } },
      plugins: ['function', 'object', 'tag']
    },
    'array': {
      input: [{ div: { id: 1, class: ['card'] } }],
      expected: [{ div: { id: 1, class: ['card'] } }],
      plugins: ['array', 'object', 'tag']
    },
    'object': {
      input: { div: { id: 1, class: ['card'] } },
      expected: { div: { id: 1, class: ['card'] } },
      plugins: ['object', 'tag']
    },
    'tag': {
      input: 'div-1.card.primary',
      expected: { div: { id: 1, class: ['card', 'primary'] } },
      plugins: ['tag']
    },
    'html': {
      input: '<div id="1" class="card primary"></div>',
      expected: { tag: 'div', attributes: { id: '1', class: 'card primary' } },
      plugins: ['html', 'tag']
    },
    'json': {
      input: '{"div": {"id": 1, "class": ["card"]}}',
      expected: { div: { id: 1, class: ['card'] } },
      plugins: ['json', 'object']
    }
  };

  Object.keys(testCases).forEach(type => {
    const { input, expected, plugins } = testCases[type];
    console.log(`Testing ${type} plugin`);

    plugins.forEach(plugin => {
      const fromMethod = soml[plugin].from;
      const toMethod = soml[plugin].to;

      if (fromMethod) {
        const result = fromMethod(input);
        console.assert(JSON.stringify(result) === JSON.stringify(expected), `Failed: from${plugin}`, { input, result, expected });
      }

      if (toMethod) {
        const result = toMethod(expected);
        console.assert(JSON.stringify(result) === JSON.stringify(input), `Failed: to${plugin}`, { input, result, expected });
      }
    });
  });
});