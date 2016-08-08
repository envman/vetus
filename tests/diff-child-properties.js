var assert = require('chai').assert
var diff = require('./../src/diff')

describe('When two objects with child properties', function() {

  //TODO: arrays!!

  var base = {
    same: { name: 'same' },
    leftDeleted: {},
    rightDeleted: {}
  }

  var left = {
    same: { name: 'same' },
    newLeft: { name: 'new field data' },
    rightDeleted: {}
  }

  var right = {
    same: { name: 'same' },
    newRight: { name: 'new data' },
    leftDeleted: {}
  }

  var difference = diff(base, left, right)

  it('Adds meta properties for child properties when same', function() {
    assert(difference.same.$name_status === 'same')
  })

  it('Adds new child object from left', function() {
    assert(difference.newLeft.name === 'new field data')
  })

  it('Adds new child object status from left', function() {
    assert(difference.$newLeft_status === 'new')
  })

  it('Adds new child object from right', function() {
    assert(difference.newRight.name === 'new data')
  })

  it('Adds new child object status from right', function() {
    assert(difference.$newRight_status === 'new')
  })

  it('removes deleted from left', function() {
    assert(difference.leftDeleted === undefined)
  })

  it('sets deleted from left status', function() {
    assert(difference.$leftDeleted_status === 'removed')
  })

  it('removes deleted from right', function() {
    assert(difference.rightDeleted === undefined)
  })

  it('sets deleted from left status', function() {
    assert(difference.$rightDeleted_status === 'removed')
  })
})
