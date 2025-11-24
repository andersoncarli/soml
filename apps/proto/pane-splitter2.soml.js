const PaneSplitter = {
  style: `
    :host {
      width: 3px;
      cursor: col-resize;
      background-color: rgba(0, 0, 0, 0.2);
    }
    
    div {
      height: 100%;
      width: 2px;
      background-color: silver;
    }
  `,
  init() {
    this.on('mousedown', this.onMouseDown);
    this.next().style.flex = 'auto';
    this.attr('draggable', false);
  },
  onMouseDown(e) {
    this.startX = e.offsetX;
    this.on('mouseup', this.stop);
    this.on('mousemove', this.move);
  },
  move(e) {
    const p = this.previous();
    p.style.width = `${e.pageX + this.startX - p.offsetLeft}px`;
    const n = this.next();
    n.style.width = `${n.offsetLeft + n.offsetWidth - e.pageX - this.offsetWidth + this.startX}px`;
  },
  stop(e) {
    this.off('mousemove', this.move);
    this.off('mouseup', this.stop);
  },
  render() {
    return {
      div: {
        style: 'display: flex; overflow: hidden;',
        div: { id: 'nav', innerText: 'nav' },
        paneSplitter: {},
        div: { style: 'flex: 1;', innerText: 'article' },
        div: { innerText: 'aside' },
      },
    };
  },
};

define('pane-splitter', PaneSplitter, { shadow: 'closed' });

const Page = {
  render() {
    return {
      main: {
        style: 'display: flex; overflow: hidden;',
        div: { id: 'nav', innerText: 'nav' },
        paneSplitter: {},
        div: { style: 'flex: 1;', innerText: 'article' },
        div: { innerText: 'aside' },
      },
    };
  },
};

const somlToDom = (obj) => {
  if (typeof obj === 'string') return document.createTextNode(obj);
  const elem = document.createElement(obj.tag);
  for (const [attr, value] of Object.entries(obj.attrs || {})) {
    if (attr === 'style') {
      Object.assign(elem.style, value);
    } else if (attr.startsWith('on')) {
      elem.addEventListener(attr.slice(2), value);
    } else {
      elem.setAttribute(attr, value);
    }
  }
  for (const child of obj.children || []) {
    elem.append(somlToDom(child));
  }
  return elem;
};

document.body.append(somlToDom(Page.render()));