// soml.js
const htmlparser2 = require('htmlparser2');

const soml = (...params) => {
  if (params.length === 0) return [];
  if (params.length === 1) {
    const param = params[0];
    for (const type of Object.keys(soml.plugins)) {
      const { from, test } = soml.plugins[type];
      if (test && test(param)) {
        const result = from(param);
        if (result !== null && result !== undefined) return result;
      }
    }
    return { value: param };
  }
  return params.map(param => {
    for (const type of Object.keys(soml.plugins)) {
      const { from, test } = soml.plugins[type];
      if (test && test(param)) {
        const result = from(param);
        if (result !== null && result !== undefined) return result;
      }
    }
    return { value: param };
  });
};

// Register a new plugin
soml.plugin = (type, { from = () => null, to = () => null, test = () => false } = {}) => {
  soml.plugins[type] = { from, to, test };
  soml[type] = { from, to };
  const upType = type.charAt(0).toUpperCase() + type.slice(1);
  soml['to' + upType] = to;
  soml['from' + upType] = from;
};

// Plugins storage
soml.plugins = {};
soml.components = {};

soml.plugin('function', {
  test: (input) => typeof input === 'function',
  from: (input) => {
    const result = input();
    const processed = soml(result);
    return Array.isArray(processed) && processed.length === 1 ? processed[0] : processed;
  },
  to: (somlObject) => () => somlObject
});

soml.plugin('array', {
  test: (input) => Array.isArray(input),
  from: (input) => input.map(item => {
    const processed = soml(item);
    return Array.isArray(processed) && processed.length === 1 ? processed[0] : processed;
  }),
  to: (somlObject) => {
    if (!Array.isArray(somlObject)) return [somlObject];
    return somlObject;
  }
});

soml.plugin('object', {
  test: (input) => input && typeof input === 'object' && !Array.isArray(input) && input.constructor === Object,
  from: (input) => input,
  to: (somlObject) => somlObject
});

soml.plugin('string', {
  test: (input) => typeof input === 'string',
  from: (input) => {
    const trimmed = input.trim();
    if (trimmed.startsWith('<')) return soml.html.from(trimmed);
    if (trimmed.startsWith('{') || trimmed.startsWith('[')) return soml.json.from(trimmed);
    const tagResult = parseTag(trimmed);
    if (tagResult) return tagResult;
    if (soml.components && soml.components[trimmed]) return soml.components[trimmed];
    return null;
  },
  to: (somlObject) => JSON.stringify(somlObject)
});

soml.plugin('tag', {
  test: (input) => false,
  from: (input) => {
    if (typeof input !== 'string') return null;
    const tagResult = parseTag(input.trim());
    return tagResult;
  },
  to: (somlObject) => JSON.stringify(somlObject)
});

soml.plugin('html', {
  test: (input) => false,
  from: (htmlString) => {
    if (typeof htmlString !== 'string') return null;
    let result = null;
    const parser = new htmlparser2.Parser({
      onopentag(name, attributes) {
        result = { tag: name, attributes };
      }
    }, { decodeEntities: true });
    parser.write(htmlString);
    parser.end();
    return result;
  },
  to: (somlObject) => {
    if (!somlObject || typeof somlObject !== 'object') return String(somlObject || '');
    
    if (Array.isArray(somlObject)) {
      return somlObject.map(item => soml.toHtml(item)).join('');
    }
    
    if (somlObject.tag && somlObject.attributes) {
      const attrs = Object.entries(somlObject.attributes)
        .map(([key, val]) => `${key}="${val}"`)
        .join(' ');
      return `<${somlObject.tag}${attrs ? ' ' + attrs : ''}></${somlObject.tag}>`;
    }
    
    const isHtmlTag = (name) => /^[a-z][a-z0-9]*$/i.test(name);
    const knownAttrs = ['id', 'class', 'href', 'src', 'type', 'name', 'value', 'placeholder', 
                        'required', 'disabled', 'checked', 'selected', 'readonly', 'rows', 'cols',
                        'width', 'height', 'alt', 'target', 'rel', 'for', 'method', 'action',
                        'charset', 'lang'];
    
    let html = '';
    for (const [tag, props] of Object.entries(somlObject)) {
      if (props === null || props === undefined) continue;
      
      if (typeof props === 'string' || typeof props === 'number' || typeof props === 'boolean') {
        html += `<${tag}>${props}</${tag}>`;
      } else if (Array.isArray(props)) {
        html += `<${tag}>${props.map(v => soml.toHtml(v)).join('')}</${tag}>`;
      } else if (typeof props === 'object') {
        const attrs = [];
        let childrenHtml = '';
        
        for (const [key, val] of Object.entries(props)) {
          if (key === 'content') {
            childrenHtml += typeof val === 'object' ? soml.toHtml(val) : String(val);
          } else if (key === 'children') {
            childrenHtml += Array.isArray(val) ? val.map(v => soml.toHtml(v)).join('') : soml.toHtml(val);
          } else if (knownAttrs.includes(key) || !isHtmlTag(key)) {
            if (key === 'class') {
              attrs.push(`class="${Array.isArray(val) ? val.join(' ') : val}"`);
            } else if (key === 'style' && typeof val === 'object') {
              const styleStr = Object.entries(val).map(([k, v]) => `${k}:${v}`).join(';');
              attrs.push(`style="${styleStr}"`);
            } else if (typeof val !== 'object') {
              const attrVal = String(val).replace(/"/g, '&quot;');
              attrs.push(`${key}="${attrVal}"`);
            }
          } else {
            childrenHtml += soml.toHtml({ [key]: val });
          }
        }
        
        html += `<${tag}${attrs.length ? ' ' + attrs.join(' ') : ''}>${childrenHtml}</${tag}>`;
      }
    }
    return html;
  }
});

soml.plugin('json', {
  test: (input) => false,
  from: (input) => {
    try {
      const parsed = JSON.parse(input);
      return parsed;
    } catch (e) {
      return null;
    }
  },
  to: (somlObject) => JSON.stringify(somlObject)
});

soml.toArray = (somlObject) => {
  if (Array.isArray(somlObject)) return somlObject;
  return [somlObject];
};

soml.toObj = (somlObject) => {
  if (Array.isArray(somlObject) && somlObject.length === 1) return somlObject[0];
  if (typeof somlObject === 'object') return somlObject;
  return { value: somlObject };
};

function parseTag(tag) {
  // Regular expression to capture tag name, numeric or custom ID, and class list
  const tagRegex = /^(h[1-6]|[a-z]+)(?:-?(\d+|[a-z]\w*))?(?:\.(.*))?$/i;
  const match = tag.match(tagRegex);
  if (!match) return null;
  let r = {}
  let [, tagName, id, classes] = match;
  id = id && isNaN(id) ? id : id ? parseInt(id, 10) : 0;
  r.id = id
  if (classes) r.class = classes.split('.')
  return { [tagName]: r }
}

module.exports = { soml, parseTag };