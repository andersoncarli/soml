import * as htmlparser2 from "htmlparser2";

function html2soml(htmlFragment, useArrays = false) {
  const stack = [{}];
  let elementCounter = {};

  function createKey(name, attributes) {
    let key = name;
    if (attributes.id) {
      key += `#${attributes.id}`;
    }
    if (attributes.class) {
      key += ' ' + attributes.class.split(/\s+/).map(c => `.${c}`).join(' ');
    }
    return key;
  }

  function addToParent(parent, key, value) {
    if (useArrays) {
      if (!parent[key]) {
        parent[key] = [];
      }
      parent[key].push(value);
    } else {
      if (parent[key]) {
        elementCounter[key] = (elementCounter[key] || 1) + 1;
        key = `${key}#${elementCounter[key]}`;
      }
      parent[key] = value;
    }
  }

  const parser = new htmlparser2.Parser(
    {
      onopentag(name, attributes) {
        const key = createKey(name, attributes);
        const element = {};

        // Add non-id, non-class attributes to the element
        for (let attr in attributes) {
          if (attr !== 'id' && attr !== 'class') {
            element[attr] = attributes[attr];
          }
        }

        const parent = stack[stack.length - 1];
        addToParent(parent, key, element);
        stack.push(element);
      },
      ontext(text) {
        const trimmedText = text.trim();
        if (trimmedText) {
          const parent = stack[stack.length - 1];
          if (Object.keys(parent).length === 0) {
            // If parent is empty, set it directly to the text
            stack[stack.length - 2][Object.keys(stack[stack.length - 2])[0]] = trimmedText;
          } else {
            // Otherwise, add to content array
            if (!parent.content) {
              parent.content = [];
            }
            parent.content.push(trimmedText);
          }
        }
      },
      onclosetag() {
        const element = stack.pop();
        // If the element has only one piece of content, simplify it
        if (element.content && element.content.length === 1) {
          element.content = element.content[0];
        }
        // If the element is empty, remove it
        if (Object.keys(element).length === 0) {
          const parent = stack[stack.length - 1];
          const key = Object.keys(parent).find(k => parent[k] === element);
          delete parent[key];
        }
      },
    },
    { decodeEntities: true }
  );

  parser.write(htmlFragment);
  parser.end();

  return stack[0];
}

// Example usage
const htmlFragment = `
  <div style="color: red; font-size: 14px;">
    <h1>Hello, World!</h1>
    <p class="description">This is a <strong>test</strong>.</p>
    <p class="note">Another paragraph</p>
  </div>
`;

console.log("Using object representation:");
console.log(JSON.stringify(html2soml(htmlFragment), null, 2));

console.log("\nUsing array representation:");
console.log(JSON.stringify(html2soml(htmlFragment, true), null, 2));