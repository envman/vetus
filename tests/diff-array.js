var assert = require('chai').assert
var diff = require('./../src/diff')

describe('When two objects are diffed', function() {

  var childA = {
    id: '1'
  }

  var childB = {
    id: '1'
  }

  var childC = {
    id: '1'
  }

  var base = {
      children: [
        childA,
        childB
    ]
  }

  var left = {
      children: [
        childB,
        childA,
        childC
      ]
  }

  var right = {
      children: [
        childA,
        childB
      ]
  }

  var difference = diff(base, left, right)

  it('Adds meta properties for same', function() {
    
  })
})
