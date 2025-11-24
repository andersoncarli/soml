function Splitter({ width:'3px' } = props) {

  return {
    // style: `width=${width}; cursor='col-resize'; background-color=rgba(0,0,0,0.2)`,
    style: { width, cursor: 'col-resize', 'background-color': 'rgba(0,0,0,0.2)' },
    div: {
      style: { height: '100%', width: '2px', 'background-color': 'silver' }
    },

    onMouseDown(e) {
      const startX = e.offsetX

      function move(e) {
        const p = e.target.previousElementSibling
        p.style.width = `${e.pageX + startX - p.offsetLeft}px`

        const n = e.target.nextElementSibling
        n.style.width = `${n.offsetLeft + n.offsetWidth - e.pageX - e.target.offsetWidth + startX}px`
      }

      on(window, 'mousemove', move)
      on(window, 'mouseup', () =>
        off(window, 'mousemove', move))
    }
  }
}

defineElement('splitter', Splitter, { shadowDom: 'closed' })