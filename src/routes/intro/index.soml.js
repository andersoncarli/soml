module.exports = soml({
  lang: "en",
  head: {
    meta: { charset: 'UTF-8', name: 'viewport', content: 'width=device-width, initial-scale=1.0' },
    title: 'Dual Code Editor',
    link: { rel: 'stylesheet', href: 'https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.13/codemirror.min.css' },
    script: 'https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.13/{codemirror.min.js,javascript.min.js,mode/xml/xml.min.js,mode/css/css.min.js',
  },
  body: {
    h1: "Welcome to SOML",
    DualCodeEditor: { files: ['example1.js', 'example2.html'] },
  }
})

soml('DualCodeEditor', (files) => {
  let options = { mode: 'javascript', lineNumbers: true, theme: 'default' }
  this.editor1 = CodeMirror($('panel1'), options);
  this.editor2 = CodeMirror($('panel2'), { ...options, mode: 'html' });

  this.loadSource(files[0], 1);
  this.loadSource(files[1], 2);

  return {
    "div .container": { //".container": [ 'div .panel #panel1', 'div .panel #panel2' ] // alternative syntax
      "div#panel1": { class: ".panel" },
      "div#panel2": { class: ".panel" },

      "style": `
          .container { display: flex; height: 100%; }
          .panel { flex: 1; padding: 10px; }
          .CodeMirror { height: 100%;`,

      loadSource(url, panelIndex) {
        fetch(url)
          .then(response => response.text())
          .then(source => {
            if (panelIndex === 1) this.editor1.setValue(source);
            else if (panelIndex === 2) this.editor2.setValue(source);
          })
          .catch(error => console.error('Failed to load source file:', error));
      }
    }
  }
})

// customElements.define('dual-code-editor', DualCodeEditor);