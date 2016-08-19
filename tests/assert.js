var assert = require('chai').assert

module.exports = function(condition, message) {
  assert(condition, message)
}

module.exports.value = function(actual, expected, message, obj) {

  if (obj) {
    message += '\n' + JSON.stringify(obj, null, 2)
  }

  assert(actual === expected, message)
}
