// Simple todo app in SOML
// adapted from https://blog.teamtreehouse.com/create-your-own-to-do-app-with-html5-and-indexeddb
return {
  head: {
    title: "Todo List App",
    link: { rel: "stylesheet", href: "todo.css" },
  },
  body: {
    form: {
      id: "form", method: "POST", action: "#",
      input: { id: "todo", type: "text", required: true, placeholder: "Enter a todo item..." },
      onsubmit: () => {
        var todo = {
          timestamp: new Date().getTime(),
          text: get('#todo').value
        }
        store.create(todo, render)
        set('#todo.value', '')
        return false
      }
    }, // form

    ul: {
      id: "list",
      li: { input: { type: "checkbox", onclick() { remove({ timestamp }) } } }
    },
  }, // body

  async script() {
    console.log(Object.keys(ut))

    const { IndexedDB, confirm } = await require('indexedb')

    const db = IndexedDB('todos')
      , store = db.open('todo', render)
      , list = get('#list')
      , template = list.innerHTML

    function render() { store.fetch((data) => list.innerHTML = data.render(template)) }

    function remove(id, checkbox) {
      confirm('Delete to do? ' + id, (doit) => {
        if (doit) store.remove(id, render)
        checkbox.checked = doit
      })
    }
  }
}