var assert = require('./assert')
var historyGenerator = require('./../src/history-generator')

describe('When generating history', function() {

  var objects = [
    {
      add: [],
      // reorder: [
      //           {one: '1',
      //           id: '11'},
      //           {two: '2',
      //           id: '22'}
      //          ],
      create: [],
      delete: [],
      recursive: [{ name: 'first' }],
      $commit: {
        author: 'rob',
        date: '2/2/12'
      }
    },
    {
      add: [{ up: '1' }],
      // reorder: [
      //           {two: '2',
      //           id: '22'},
      //           {one: '1',
      //           id: '11'}
      //          ],
      create: [],
      recursive: [{ name: 'second' }],
      $commit: {
        author: 'jamie',
        date: '3/3/13'
      }
    },
  ]

  var history = historyGenerator(objects)

  it('contains array add', function() {
    assert(history.add)
  })

  it('contains array create', function() {
    assert(history.create)
  })

  it('contains array recursive', function() {
    assert(history.recursive)
  })

  it('Array history item added', function() {
    assert(history.$hist_add === 'Modified by jamie at 3/3/13')
  })

  it('Array history item created', function() {
    assert(history.$hist_create === 'Created by rob at 2/2/12')
  })

  it('Array history item recursive', function() {
    assert(history.$hist_recursive === 'Modified by jamie at 3/3/13')
  })

  it('latest value shown', function() {
    assert(history.add[0].up === '1')
  })

  it('Adds added commit', function() {
    assert(history.add[0].$hist_array === 'Updated by jamie at 3/3/13')
  })

  it('Adds added commit (array)', function() {
    assert(history.add[0].$hist_array === 'Updated by jamie at 3/3/13')
  })

  it('Processes array items recursively', function() {
    assert.value(history.recursive[0].name, 'second', 'Name property')
  })

  it('Adds history recursively for array items', function() {
    assert.value(history.recursive[0]['$hist_name'], 'Modified by jamie at 3/3/13', 'Recursive history')
  })

  it('Deleted items handled correctly', function() {
    assert(!history.hasOwnProperty('delete') && !history.hasOwnProperty('$hist_delete'))
  })

  // it('Reordered array items handled correctly', function() {
  //   assert(Object.keys(history.reorder[0])[0] === 'one' && Object.keys(history.reorder[1])[0] === 'two')
  // })


  // Reordered array items
  // deleted array items
  // New item with id (use: var timestamp = new Date().valueOf())
  // Handle array leafs
})
