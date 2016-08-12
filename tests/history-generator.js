var assert = require('chai').assert
var historyGenerator = require('./../src/history-generator')

describe('When generating history', function() {

  var objects = [
    {name: 'first', $user: 'jamie', $commit: 'my-commit', $date: '1/1/2012'},
    {name: 'second'}
  ]

  var history = historyGenerator()

  it('latest value shown', function() {
    assert(history.name === 'second')
  })

  it('latest value shown', function() {
    assert(history.$hist_name === 'updated by jamie in commit my-commit on 1/1/2012')
  })
})
