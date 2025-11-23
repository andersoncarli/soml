import * as htmlparser2 from "htmlparser2";

function html2object(htmlFragment) {
  const root = { children: [] };
  const stack = [root];

  function parseStyle(styleString) {
    return styleString.split(';').reduce((acc, style) => {
      const [key, value] = style.split(':').map(s => s.trim());
      if (key && value) {
        acc[key] = value;
      }
      return acc;
    }, {});
  }

  function getCurrentPath() {
    return stack.slice(1).map(el => el.tag).join('/');
  }

  const parser = new htmlparser2.Parser(
    {
      onopentag(name, attributes) {
        const parent = stack[stack.length - 1];
        const path = getCurrentPath() + '/' + name;
        const element = {
          tag: name,
          style: attributes.style ? parseStyle(attributes.style) : {},
          children: [],
          parent: parent,
          path: path,
          state: {},
          attributes: { ...attributes }
        };
        delete element.attributes.style;
        parent.children.push(element);
        stack.push(element);
      },
      ontext(text) {
        const parent = stack[stack.length - 1];
        const trimmedText = text.trim();
        if (trimmedText) {
          const path = getCurrentPath() + `/text()[${parent.children.length + 1}]`;
          parent.children.push({
            type: 'text',
            content: trimmedText,
            parent: parent,
            path: path
          });
        }
      },
      onclosetag(tagname) {
        stack.pop();
      },
    },
    { decodeEntities: true }
  );

  parser.write(htmlFragment);
  parser.end();

  return root.children[0];  // Return the first child of root, which is our actual root element
}

// Example usage
const htmlFragment = `
  <div style="color: red; font-size: 14px;">
    <h1>Hello, World!</h1>
    <p class="description">This is a <strong>test</strong>.</p>
  </div>
`;

const result = html2object(htmlFragment);
console.log(JSON.stringify(result, null, 2));