# SOML - The Simple Object Markup Language

SOML is an **isomorphic representation of HTML in Javascript**. A standard way to represent HTML elements as pure Javascript objects.

Its objective is to deprecate the use of HTML in favor of simpler and more direct format using  Javascript objects.

We can say that **SOML is to HTML what JSON is to XML**. A way to represent data in a more compact, portable and readable way.

## Why?

Lets face a reality, web development is a mess. We must write a lot of code to do simple things.

To understand the root of the problemm, and why this is as it is, we need to remember that html was born before javascript, creating a priority inversion. Where the HTML (the static declarative document description laguage) loads javascript (a much more powerfull turing complete language), that was created as a axiliary dinamic language used to manipulate html elements.

This way the mess was created. And we end up having javascript functions to parse react componets that transforms jsx code to html static that will load javascript files and so on...

But... **What if we could fix the problem changing the order of the technologies?** What if whe remove all reference to html until the last moment?

Thats the reason for creating SOML:

Simplify the construction of HTML pages fixing this inversion, allowing creating HTML elements without HTML at all. But still using the same HTML tags an technology, refering exactly the the same HTML element and document trees. and producing the exact same document at the end.

As a bonus we get a streamlined flow between server and client avoiding transpilation al all.

Yes! you read right, **no transpilation**. Since cliente and server can communicate in pure javascript. No more Babel and build time! It just a matter of loading the server and uploading the objects to the client.

Look at the fragments bellow. At left we have a HTML page and at right the isomorphic SOML representation.

<div style="display: flex; justify-content: space-between;">
<div style="width: 48%; code { white-space : pre-wrap !important; }">

```html
<!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="UTF-8" name="viewport">
  <title>This is a HTML Page</title>
  <link rel="stylesheet" href="...">
  <style>
    .body { display:block; width:100%; }
  </style>
</head>

<body>
  <h1>Welcome</h1>
  <script>
    console.log("Hello, World!");
  </script>
</body>
</html>
```

</div>
<div style="width: 48%;">

```javascript
{
  lang: "en",

  head: {
    meta: { charset: 'UTF-8', name: 'viewport'},
    title: 'This is a SOML Page',
    link: { rel: 'stylesheet', href: '...' },
    style: {
      '.body': { display:'block'; width:'100%' }
    },
  },

  body: {
    h1: "Welcome",
    script: () => {
      console.log("Hello, World!");
    }
  }
}
```

</div>
</div>

Notice how they are almost the same. Thats what we call **Isomorphic** representation.

I tried to keep them as similar as possible to show how easy is to migrate from HTML to SOML. After all, SOML can do all the things that HTML can do and more. But SOML is more compact and readable. And it is also much more powerful, because it is javascript. BTW: Which one do you think is more readable and seems more intuitive?

## SOML is a superset of HTML and CSS

This means that you can use all the HTML and CSS features in SOML. Not only that, SOML is a Rosetta Stone for all document formats. It can be converted back and forth to HTML, XML, JSON, YAML, MARKDOWN, etc. More on this later.

From this point, we need to talk about the different formats that SOML supports using javascript.

## SOML Formats: `object`, `array` & `function`

If you are a atentive reader you may have asked yourself:

>What if we have 2 elements with the same name? How are they going to be represented?

Well, the answer is simple: we just need to add the id as part of the key, like `div#1` or `div.container`

### Consider the following HTML fragment

```javascript
return `
<div style="color:red; font-size:14px;">
  <h1>Hello, World!</h1>
  <p class="description">This is a <strong>test</strong>.</p>
  <p class="note">Another paragraph</p>
</div>`
```

### It can represented in SOML as

```javascript
return {
  "style": "color:red; font-size:14px;",
  "h1": "Hello, World!",
  "p.description": ['This is a ', { "strong": "test" }, '.'],
  "p.note": "Another paragraph", // Notice the class in the key
  "p#3": "Yet another" // Notice the id in the key
}
```

That simple convention: All elements must have an id in its key, allows us to represent any html element in the format `{ tag: content }`, as far we have different keys. Also, the `#` and `.` are just syntactic sugar for the `id` and `class` attributes in the emmet style.

### The `array` format `[tag, ...content, [children]]`

It is a more compact representation, having the first element as the tag. and the rest of the elements as the content. The children are optional and can be represented as an array of elements.

```javascript
return [
  ["style", "color:red; font-size:14px;"],
  ["h1", "Hello, World!"],
  ["p.description", 'This is a ', ['strong', "test"], '.'],
  ["p.note", "Another paragraph"]
]
```

### The `function` format `tag( ...content, [children])`.

In this format, each element is represented as a function call and the content is passed as arguments.

```javascript
const {div, style, h1, p} = soml.html
return div(
  style("color: red; font-size: 14px;"),
  h1("Hello, World!"),
  p(".description", ['This is a ', strong("test"), '.']),
  p(".note", "Another paragraph"),
)
```

# The soml() function

The SOML function is the cornestone of the SOML library. It is the only function that you need to know to use SOML.

It is a function that takes a element definition in any format and and returns a SOML object.

```javascript
const soml = require('soml')

const helloHtml = soml.fromHtml(`<h1>Hello, World!</h1>`)
const helloJson = soml.fromJson(`{ "h1": "Hello, World!" }`)
const helloYaml = soml.fromYaml(`h1: Hello, World!`)
const helloMarkdown = soml.md(`# Hello, World!`)

test('soml()', () => {
  const hello = { h1: "Hello, World!" }

  // here, all these objects are the same:
  check(helloHtml, hello)
  check(helloJson, hello)
  check(helloYaml, hello)
  check(helloMarkdown, hello)

  // as well, we can convert this soml object to html, json, yaml, markdown, etc.
  check(hello.toJson(), '{"h1":"Hello, World!"}')
  check(hello.toHtml(), '<h1>Hello, World!</h1>')
  check(hello.toMarkdown(), '# Hello, World!')
  check(hello.soml(), '{h1:"Hello, World!"}')
})
```

Thats the reason why we called it the **Rosetta Stone** of all document formats.

```javascript
// converting a html fragment to soml object
test('soml_obj', () =>
  check(soml_obj, soml.to('soml:object', html_fragment)))

// converting a html fragment to soml array
test('soml_array', () =>
  check(soml_array, soml.to('soml:array', html_fragment)))

// converting a html fragment to soml function
test('soml_func', () =>
  check(soml_func, soml.to('soml:func', html_fragment)))
```
