const test = require('node:test');

function toSource(v) {
  if (v === undefined) return 'undefined'
  let s = JSON.stringify(v) || ''
  return s.replace(/"([a-zA-Z_$][a-zA-Z_$0-9]*)":/gm, '$1:')
}
const assert = require('node:assert');

function check(a, b, message) {
  if (typeof a !== 'string') a = toSource(a)
  if (typeof b !== 'string') b = toSource(b)
  console.log(a, b, message)
  assert.equal(a, b, message)
}

module.exports = { test, check }