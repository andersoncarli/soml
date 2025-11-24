const testPage = {
  html: {
    head: {
      title: "SOML Tests",
      script: "soml.js; ./tests.js",
    },
    body: {
      div: { id: "testbed" }
    },
    script() {

    }
  }
}

// Test cases for dom2som
test('dom2som() should convert a DOM tree to a SOM object', () => {
  // Test case 1
  const dom = document.createElement('div');
  dom.innerHTML = '<p>Hello, world!</p><a href="#">Hello, world!</a>';
  var som = dom2som(dom);
  check(JSON.stringify(som) == '{"div":{"p":"Hello, world!","a":{"href":"#","Hello, world!":null}}}');

  // Test case 2
  dom = document.createElement('div');
  dom.innerHTML = '<p>Hello, world!</p><a href="#" onclick="console.log(\'Hello, world!\')">Hello, world!</a>';
  som = dom2som(dom);
  check(JSON.stringify(som) == '{"div":{"p":"Hello, world!","a":{"href":"#","onclick":"console.log(\'Hello, world!\')","Hello, world!":null}}}');

  // Test case 3
  dom = document.createElement('div');
  dom.innerHTML = '<p>Hello, world!</p><a href="#" onclick="console.log(event)">Hello, world!</a>';
  som = dom2som(dom);
  check(som.div.p == 'Hello, world!');
  check(som.div.a.href == '#');
  check(typeof som.div.a.onclick == 'function');
})

module.exports = { testPage }