var assert = require('chai').assert
var historyGenerator = require('./../src/history-generator')

describe('When generating history', function() {

  var objects = [
    {name: 'first', $commit: { author:'jamie', date:'1/1/12'}},
    {name: 'second', $commit: { author: 'rob', date: '2/2/12' }}
  ]

  var history = historyGenerator(objects)

  it('latest value shown', function() {
    assert(history.name === 'second')
  })

  it('latest value shown', function() {
    assert(history.$hist_name, '$hist_name node missing')
    assert(history.$hist_name === 'Modified by rob at 2/2/12', '$hist_name incorrect value: ' + history.$hist_name)
  })
})
