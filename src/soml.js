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
  from: (input) => normalizeObject(input),
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
    
    // ✅ NORMALIZE CONCISE SYNTAX FIRST!
    if (!Array.isArray(somlObject) && somlObject.constructor === Object) {
      somlObject = normalizeObject(somlObject);
    }
    
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
      
      // Handle script as function
      if (tag === 'script' && typeof props === 'function') {
        const fnStr = props.toString();
        const fnBody = fnStr.substring(fnStr.indexOf('{') + 1, fnStr.lastIndexOf('}'));
        html += `<script>${fnBody}</script>`;
        continue;
      }
      
      if (typeof props === 'string' || typeof props === 'number' || typeof props === 'boolean') {
        html += `<${tag}>${props}</${tag}>`;
      } else if (Array.isArray(props)) {
        html += `<${tag}>${props.map(v => soml.toHtml(v)).filter(Boolean).join('')}</${tag}>`;
      } else if (typeof props === 'object') {
        const attrs = [];
        let childrenHtml = '';
        
        for (const [key, val] of Object.entries(props)) {
          if (key === 'content') {
            childrenHtml += typeof val === 'object' ? soml.toHtml(val) : String(val);
          } else if (key === 'text') {
            childrenHtml += String(val);
          } else if (key === 'children') {
            childrenHtml += Array.isArray(val) ? val.map(v => soml.toHtml(v)).filter(Boolean).join('') : soml.toHtml(val);
          } else if (key.startsWith('on') && typeof val === 'function') {
            // Event handler - convert function to inline handler
            const fnStr = val.toString();
            const fnBody = fnStr.substring(fnStr.indexOf('{') + 1, fnStr.lastIndexOf('}'));
            attrs.push(`${key}="${fnBody.trim().replace(/"/g, '&quot;')}"`);
          } else if (key === 'style') {
            // Handle style attribute (string or object)
            if (typeof val === 'object') {
              const styleStr = Object.entries(val).map(([k, v]) => `${k}:${v}`).join(';');
              attrs.push(`style="${styleStr}"`);
            } else if (typeof val === 'string') {
              attrs.push(`style="${val.replace(/"/g, '&quot;')}"`);
            }
          } else if (knownAttrs.includes(key) || !isHtmlTag(key)) {
            if (key === 'class') {
              attrs.push(`class="${Array.isArray(val) ? val.join(' ') : val}"`);
            } else if (typeof val !== 'object' && typeof val !== 'function') {
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
  // Support space-separated classes: 'h5 card-title text-primary' or 'button-123 btn btn-primary'
  const parts = tag.trim().split(/\s+/);
  const firstPart = parts[0];
  const spaceSeparatedClasses = parts.slice(1);
  
  // Regular expression to capture tag name, numeric or custom ID, and class list
  const tagRegex = /^(h[1-6]|[a-z]+)(?:-?(\d+|[a-z]\w*))?(?:\.(.*))?$/i;
  const match = firstPart.match(tagRegex);
  if (!match) return null;
  let r = {}
  let [, tagName, id, classes] = match;
  id = id && isNaN(id) ? id : id ? parseInt(id, 10) : 0;
  
  // Only set id if it's not 0
  if (id !== 0) r.id = id;
  
  // Combine dot-separated and space-separated classes
  const allClasses = [];
  if (classes) allClasses.push(...classes.split('.'));
  if (spaceSeparatedClasses.length > 0) allClasses.push(...spaceSeparatedClasses);
  if (allClasses.length > 0) r.class = allClasses;
  
  return { [tagName]: r }
}

const HTML_TAGS = ['div', 'span', 'p', 'a', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 
  'ul', 'ol', 'li', 'table', 'tr', 'td', 'th', 'form', 'input', 'button', 
  'label', 'select', 'option', 'textarea', 'img', 'video', 'audio', 'canvas',
  'header', 'footer', 'nav', 'main', 'section', 'article', 'aside', 'script',
  'style', 'link', 'meta', 'title', 'body', 'head', 'html', 'small', 'strong', 'em', 'b', 'i'];

function isTagExpression(key) {
  // Don't treat data-* and aria-* attributes as tag expressions
  if (/^(data|aria)-/.test(key)) return false;
  
  // Check if string contains tag syntax indicators (- or . or space)
  if (/-/.test(key) || /\./.test(key) || /\s/.test(key)) return true;
  // Check if it's a pure number
  if (/^\d+$/.test(key)) return true;
  // Check if first word is an HTML tag followed by space
  const firstWord = key.split(/\s+/)[0];
  if (HTML_TAGS.includes(firstWord)) return true;
  return false;
}

function expandTagExpression(key) {
  // Extract potential tag name from the beginning (before space or dash)
  const parts = key.trim().split(/\s+/);
  const firstPart = parts[0];
  const spaceSeparatedClasses = parts.slice(1);
  
  // Match tag name (letters + optional numbers for h1-h6)
  const tagMatch = firstPart.match(/^(h[1-6]|[a-z]+)/i);
  const potentialTag = tagMatch ? tagMatch[1] : null;
  
  // console.log('expandTagExpression:', key, 'potentialTag:', potentialTag, 'isHTMLTag:', HTML_TAGS.includes(potentialTag));
  
  // If it starts with a known HTML tag, parse as-is or convert dashes after tag to dots
  if (potentialTag && HTML_TAGS.includes(potentialTag)) {
    // Try to parse as-is first
    let parsed = parseTag(key);
    // console.log('parsed:', JSON.stringify(parsed));
    if (parsed) return parsed;
    
    // If parsing failed, convert dashes after tag to dots for class names
    // e.g., 'button-cta-primary' becomes 'button.cta.primary' (id=0, classes)
    // or 'p-123-special' would be parsed differently
    const afterTag = firstPart.substring(potentialTag.length);
    if (afterTag.startsWith('-')) {
      // Check if what follows is a number or id
      const rest = afterTag.substring(1);
      const firstSegment = rest.split(/[.-]/)[0];
      if (firstSegment && !isNaN(firstSegment)) {
        // It's a number, keep first dash, convert rest to dots
        const afterId = rest.substring(firstSegment.length);
        const reconstructed = potentialTag + '-' + firstSegment + afterId.replace(/-/g, '.');
        return parseTag(spaceSeparatedClasses.length > 0 ? reconstructed + ' ' + spaceSeparatedClasses.join(' ') : reconstructed);
      } else {
        // Not a number, convert all dashes to dots (treat as classes)
        const reconstructed = potentialTag + '-0.' + rest.replace(/-/g, '.');
        return parseTag(spaceSeparatedClasses.length > 0 ? reconstructed + ' ' + spaceSeparatedClasses.join(' ') : reconstructed);
      }
    }
    return parsed;
  }
  
  // Otherwise, treat as div with id/classes
  // Convert dashes to dots to treat them as class separators
  // e.g., 'container-main' becomes 'div-container.main'
  const withDots = firstPart.replace(/-/g, '.');
  const reconstructed = 'div-' + withDots;
  return parseTag(spaceSeparatedClasses.length > 0 ? reconstructed + ' ' + spaceSeparatedClasses.join(' ') : reconstructed);
}

function normalizeObject(obj) {
  if (!obj || typeof obj !== 'object' || Array.isArray(obj)) return obj;
  
  const result = {};
  const children = [];
  
  for (const [key, value] of Object.entries(obj)) {
    // Special attributes that can be HTML tags but should be treated as attributes when value is string/object
    const isAttributeContext = ['style'].includes(key) && (typeof value === 'string' || (typeof value === 'object' && !Array.isArray(value)));
    
    // Check if key is an HTML tag (but not in attribute context)
    const isHtmlTag = HTML_TAGS.includes(key) && !isAttributeContext;
    
    // Check if key is a tag expression (id/class syntax)
    const isTagExpr = !isAttributeContext && isTagExpression(key);
    
    if (isHtmlTag) {
      // Direct HTML tag
      let tagContent = {};
      if (typeof value === 'string' || typeof value === 'number') {
        tagContent = { text: String(value) };
      } else if (typeof value === 'function') {
        tagContent = {};
      } else if (Array.isArray(value)) {
        // Array of children
        tagContent = { children: value };
      } else if (typeof value === 'object' && !Array.isArray(value)) {
        // Recursively process nested content
        const normalized = normalizeObject(value);
        if (Array.isArray(normalized)) {
          // Multiple children returned
          tagContent = { children: normalized };
        } else if (normalized && typeof normalized === 'object') {
          const nestedChildren = [];
          let attrs = {};
          for (const [nestedKey, nestedValue] of Object.entries(normalized)) {
            // Check if this should be treated as an attribute (e.g., style with string value)
            const isNestedAttr = ['style'].includes(nestedKey) && (typeof nestedValue === 'string' || (typeof nestedValue === 'object' && !Array.isArray(nestedValue)));
            
            if (!isNestedAttr && (HTML_TAGS.includes(nestedKey) || isTagExpression(nestedKey))) {
              // This is a child element
              let childExpanded;
              if (isTagExpression(nestedKey)) {
                childExpanded = expandTagExpression(nestedKey);
                // Merge the value into the expanded tag
                const childTagName = Object.keys(childExpanded)[0];
                const childAttrs = childExpanded[childTagName];
                if (typeof nestedValue === 'string' || typeof nestedValue === 'number') {
                  childExpanded[childTagName] = { ...childAttrs, text: String(nestedValue) };
                } else if (typeof nestedValue === 'object') {
                  childExpanded[childTagName] = { ...childAttrs, ...nestedValue };
                }
              } else {
                childExpanded = { [nestedKey]: nestedValue };
              }
              nestedChildren.push(childExpanded);
            } else {
              // This is an attribute
              attrs[nestedKey] = nestedValue;
            }
          }
          if (nestedChildren.length > 0) {
            tagContent = { ...attrs, children: nestedChildren };
          } else {
            tagContent = attrs;
          }
        } else {
          tagContent = normalized;
        }
      } else {
        tagContent = value;
      }
      children.push({ [key]: tagContent });
    } else if (isTagExpr) {
      // Tag expression with id/class syntax
      const expanded = expandTagExpression(key);
      if (expanded) {
        const tagName = Object.keys(expanded)[0];
        const tagAttrs = expanded[tagName];
        
        let tagContent = {};
        if (typeof value === 'string' || typeof value === 'number') {
          tagContent = { ...tagAttrs, text: String(value) };
        } else if (typeof value === 'function') {
          tagContent = tagAttrs;
        } else if (Array.isArray(value)) {
          // Array of children
          tagContent = { ...tagAttrs, children: value };
        } else if (typeof value === 'object' && !Array.isArray(value)) {
          // Recursively process nested content
          const normalized = normalizeObject(value);
          if (Array.isArray(normalized)) {
            // Multiple children returned
            tagContent = { ...tagAttrs, children: normalized };
          } else if (normalized && typeof normalized === 'object') {
            const nestedChildren = [];
            let attrs = { ...tagAttrs };
            for (const [nestedKey, nestedValue] of Object.entries(normalized)) {
              // Check if this should be treated as an attribute (e.g., style with string value)
              const isNestedAttr = ['style'].includes(nestedKey) && (typeof nestedValue === 'string' || (typeof nestedValue === 'object' && !Array.isArray(nestedValue)));
              
              if (!isNestedAttr && (HTML_TAGS.includes(nestedKey) || isTagExpression(nestedKey))) {
                // This is a child element
                let childExpanded;
                if (isTagExpression(nestedKey)) {
                  childExpanded = expandTagExpression(nestedKey);
                  // Merge the value into the expanded tag
                  const childTagName = Object.keys(childExpanded)[0];
                  const childAttrs = childExpanded[childTagName];
                  if (typeof nestedValue === 'string' || typeof nestedValue === 'number') {
                    childExpanded[childTagName] = { ...childAttrs, text: String(nestedValue) };
                  } else if (typeof nestedValue === 'object') {
                    childExpanded[childTagName] = { ...childAttrs, ...nestedValue };
                  }
                } else {
                  childExpanded = { [nestedKey]: nestedValue };
                }
                nestedChildren.push(childExpanded);
              } else {
                // This is an attribute
                attrs[nestedKey] = nestedValue;
              }
            }
            if (nestedChildren.length > 0) {
              tagContent = { ...attrs, children: nestedChildren };
            } else {
              tagContent = attrs;
            }
          } else {
            tagContent = { ...tagAttrs, ...normalized };
          }
        } else {
          tagContent = { ...tagAttrs, ...value };
        }
        
        children.push({ [tagName]: tagContent });
      }
    } else {
      // Regular property (attribute)
      if (typeof value === 'object' && !Array.isArray(value) && value !== null) {
        result[key] = normalizeObject(value);
      } else {
        result[key] = value;
      }
    }
  }
  
  // If we collected children, add them to result
  if (children.length > 0) {
    if (Object.keys(result).length === 0) {
      // Only children, return the structure
      return children.length === 1 ? children[0] : children;
    }
    result.children = children;
  }
  
  return result;
}

module.exports = { soml, parseTag };