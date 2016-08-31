var assert = require('./assert')
var historyGenerator = require('./../src/history-generator')

describe('When generating history', function() {

  var objects = [
    {
      add: [],
      recursive: [{ name: 'first' }],
      $commit: {
        author: 'rob',
        date: '2/2/12'
      }
    },
    {
      add: [{ id: '1' }],
      recursive: [ { name: 'second' } ],
      $commit: {
        author: 'jamie',
        date: '3/3/13'
      }
    },
  ]

  var history = historyGenerator(objects)

  it('contains array', function() {
    assert(history.add)
  })

  it('Array history item added', function() {
    assert(history.$hist_add === '??')
  })

  it('latest value shown', function() {
    assert(history.add.length === 1)
  })

  it('Adds added commit', function() {
    assert(history.add[0]['$hist_arr'] === 'Created..')
  })

  it('Processes array items recursively', function() {
    assert.value(history.recursive[0].name, 'second', 'Name property')
  })

  it('Adds history recursively for array items', function() {
    assert.value(history.recursive[0]['$hist_name'], 'Modified by jamie at 3/3/13', 'Recursive history')
  })


  // Reordered array items
  // deleted array items
  // New item with id
})
