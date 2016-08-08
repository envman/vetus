var assert = require('chai').assert
var diff = require('./../src/diff')

describe('When two objects are diffed', function() {

  var base = {
    same: 'same',
    leftUpdate: 'base',
    rightUpdate: 'base',
    conflict: 'base',
    number: 2,
    removeLeft: 'remove',
    removeRight: 'remove'
  }

  var left = {
    same: 'same',
    new: 'same',
    leftUpdate: 'updated',
    rightUpdate: 'base',
    conflict: 'updated-left',
    number: 2,
    newLeft: 'new',
    removeRight: 'remove'
  }

  var right = {
    same: 'same',
    new: 'same',
    leftUpdate: 'base',
    rightUpdate: 'updated',
    conflict: 'updated-right',
    number: 3,
    newRight: 'new',
    removeLeft: 'remove'
  }

  var difference = diff(base, left, right)

  it('Adds meta properties for same', function() {
    assert(difference.$same_status === 'same')
  })

  it('Adds same for two new with same value', function() {
    assert(difference.$new_status === 'same')
  })

  it('Marks changed for left update', function() {
    assert(difference.$leftUpdate_status === 'changed')
  })

  it('Takes the left if left changed', function() {
    assert(difference.leftUpdate === 'updated')
  })

  it('Marks changed for right update', function() {
    assert(difference.$rightUpdate_status === 'changed')
  })

  it('Takes the left if left changed', function() {
    assert(difference.rightUpdate === 'updated')
  })

  it('Marks conflict', function() {
    assert(difference.$conflict_status === 'conflict')
  })

  it('Leaves base in conflict', function() {
    assert(difference.conflict === 'base')
  })

  it('Marks changed for numbers', function() {
    assert(difference.$number_status === 'changed')
  })

  it('Takes correct for numbers', function() {
    assert(difference.number === 3)
  })

  it('Marks left new as new', function() {
    assert(difference.$newLeft_status === 'new')
  })

  it('Takes left new value', function() {
    assert(difference.newLeft === 'new')
  })

  it('Marks right new as new', function() {
    assert(difference.$newRight_status === 'new')
  })

  it('Takes right new value', function() {
    assert(difference.newRight === 'new')
  })

  it('Marks removed from left', function() {
    assert(difference.$removeLeft_status === 'removed')
  })

  it('Marks removes left from diff', function() {
    assert(difference.removeLeft === undefined)
  })

  it('Marks removed from right', function() {
    assert(difference.$removeRight_status === 'removed')
  })

  it('Marks removes right from diff', function() {
    assert(difference.removeRight === undefined)
  })
})
