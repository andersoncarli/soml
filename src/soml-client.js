// SOML Client-side helpers - inspired by apps/proto/dom.js
(function() {
  // Find elements by selector
  function find(key) {
    if (key === 'window') return [window];
    key = key.trim();
    let r;
    try {
      switch (key.charAt(0)) {
        case '#': r = [document.getElementById(key.substr(1))]; break;
        case '.': r = [...document.getElementsByClassName(key.substr(1))]; break;
        default: r = [...document.getElementsByTagName(key)];
      }
    } catch (err) {
      r = [document.getElementById(key)];
      if (!r) r = [...document.getElementsByClassName(key)];
      if (!r) throw new Error(`get() Element ${key} not found.`);
    }
    return r.filter(Boolean);
  }

  // Get element(s) - returns single element or array
  function get(key) {
    const r = find(key);
    return r.length === 1 ? r[0] : r;
  }

  // Select elements - always returns array
  function select(key) {
    return [...document.querySelectorAll(key)];
  }

  // Set element content/attributes
  function set(keys, value = '') {
    keys.split(',').forEach(key => {
      try {
        const [, prefix, tag, attribute] = /([^\w]?)([^\s\.]+)\.?([\w-_]+)?/.exec(key.trim());
        find(prefix + tag).forEach(e => {
          if (attribute === 'value')
            e.value = value;
          else if (attribute)
            e.setAttribute(attribute, value);
          else
            e.innerHTML = value;
        });
      } catch (error) {
        throw new Error(`set(${key}): Not found`);
      }
    });
  }

  // Event delegation - on('#title.click, .menu.click', handler)
  function on(keys, callback) {
    keys.split(/\s*,\s*/).forEach(key => {
      try {
        const [, prefix, tag, event] = /([\.#]?)([\w\d-]+)\.([\w\d]+)/.exec(key);
        find(prefix + tag).forEach(e => e.addEventListener(event, callback));
      } catch (error) {
        throw new Error(`on(${keys}): Not found`);
      }
    });
  }

  // Extend Node prototypes for chaining
  if (typeof Node !== 'undefined') {
    Node.prototype.on = function(events, fn) {
      events.split(/\s*,\s*/).forEach(ev => this.addEventListener(ev, fn));
      return this;
    };

    if (typeof NodeList !== 'undefined') {
      Object.setPrototypeOf(NodeList.prototype, Array.prototype);
      NodeList.prototype.on = function(name, fn) {
        this.forEach(elem => elem.on(name, fn));
        return this;
      };
    }
  }

  // Convert SOML to DOM element
  function somlToDOM(somlObj) {
    if (!somlObj || typeof somlObj !== 'object') {
      return document.createTextNode(String(somlObj || ''));
    }

    // Handle array of SOML objects
    if (Array.isArray(somlObj)) {
      const fragment = document.createDocumentFragment();
      somlObj.forEach(item => fragment.appendChild(somlToDOM(item)));
      return fragment;
    }

    // Get tag name and properties
    const tagName = Object.keys(somlObj)[0];
    const props = somlObj[tagName];

    // Create element
    const el = document.createElement(tagName);

    // Handle different property types
    if (typeof props === 'string' || typeof props === 'number') {
      el.textContent = String(props);
    } else if (typeof props === 'object' && !Array.isArray(props)) {
      for (const [key, value] of Object.entries(props)) {
        if (key === 'text' || key === 'content') {
          el.textContent = String(value);
        } else if (key === 'children') {
          const children = Array.isArray(value) ? value : [value];
          children.forEach(child => {
            if (child) el.appendChild(somlToDOM(child));
          });
        } else if (key === 'class') {
          el.className = Array.isArray(value) ? value.join(' ') : value;
        } else if (key === 'style' && typeof value === 'object') {
          Object.assign(el.style, value);
        } else if (key.startsWith('on') && typeof value === 'function') {
          const eventName = key.substring(2).toLowerCase();
          el.addEventListener(eventName, value);
        } else if (key.startsWith('data-')) {
          el.setAttribute(key, value);
        } else if (typeof value !== 'object' && typeof value !== 'function') {
          el.setAttribute(key, value);
        }
      }
    }

    return el;
  }

  // Parse tag expression: 'div-id class1 class2' -> { tag, id, classes }
  function parseTagExpr(expr) {
    const parts = expr.trim().split(/\s+/);
    const firstPart = parts[0];
    const classes = parts.slice(1);

    // Extract tag and id from first part
    const match = firstPart.match(/^([a-z][a-z0-9]*)?(?:-([a-z0-9]+))?$/i);
    if (!match) return { tag: 'div', id: null, classes };

    const tag = match[1] || 'div';
    const id = match[2] || null;

    return { tag, id, classes };
  }

  // Create element from concise syntax: 'div-myid card shadow' -> DOM element
  function create(tagExpr, content = null) {
    const { tag, id, classes } = parseTagExpr(tagExpr);
    const el = document.createElement(tag);
    
    if (id) el.id = id;
    if (classes.length > 0) el.className = classes.join(' ');
    
    if (content !== null) {
      if (typeof content === 'string' || typeof content === 'number') {
        el.textContent = String(content);
      } else if (content instanceof Node) {
        el.appendChild(content);
      } else if (typeof content === 'object') {
        // SOML object
        const child = somlToDOM(content);
        el.appendChild(child);
      }
    }
    
    return el;
  }

  // Global shortcuts
  if (typeof window !== 'undefined') {
    window.get = window.$ = get;
    window.select = window.$$ = select;
    window.set = set;
    window.on = on;
    window.soml = somlToDOM;
    window.create = create;
  }

  // CentralStation client wrapper
  if (typeof CentralStation !== 'undefined' && !window.cs) {
    window.cs = new CentralStation();
  }
})();

