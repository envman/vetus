var assert = require('./assert')
var clone = require('clone')
// var historyGenerator = require('./../src/history-generator')

let getProperties = function(obj) {
  return Object.getOwnPropertyNames(obj)
    .filter(p => !p.startsWith('$'))
    .filter(p => !(Array.isArray(obj) && p === 'length'))
}

// NEED TO COPY NODE AT TOP LEVEL!?!?!?!?!
// MAY NEED ADDITONAL HISTORY AT TOP LEVEL
// MAY BE ABLE TO REMOVE OLD PASSING AND JUST PASS GRAPH LIKE ABOVE

let historyGenerator = function(stages, graph) {
  for (let stage of stages) {
    var newGraph = clone(stage)
    processStage(graph, stage, newGraph, stage['$meta'])
    graph = newGraph
  }

  return graph
}

let processStage = function(old, node, graph, meta) {
  let state = null

  if (typeof(node) === 'object') {
    let history = {}

    for (let prop of getProperties(node)) {
      var res = processStage(old && old[prop], node[prop], graph[prop], meta)
      history[prop] = old && old['$history'][prop] || { state: 'created', last: meta }

      // if history prop mark as modified?

      if (res.state) {
          history[prop] = { state: res.state, last: meta }
          state = 'modified'
      }
    }

    graph['$history'] = history
  } else {
    if (node != old) {
      state = 'modified'

      if (!old) {
        state = 'created'
      }
    }
  }

  return {
    state: state
  }
}

// TODO:
// arrays (simple & object)
// With a pre existing history passed (should work just needs tests)
// History modes (none, normal)

// V2
// array reorder (for simple modification is taken as position based)
// array reorder objects (can use optional id tags to mark positions, should work as much as possible without)
// change of type
// History mode (full)

// V3
// Mixed Arrays (simple & object)
// arrays in arrays / sub objects (this array in array is invalid case for now)

describe('When generating history', function() {
  describe('Initial creation', function() {
    var stages = [{ prop: 'name', $meta: { commit: '1' } }]

    var history = historyGenerator(stages)

    it('Should have the property', function() {
      assert(history.prop === 'name')
    })

    it('Should have the history', function() {
      assert(history['$history']['prop']['last']['commit'] === '1')
    })

    it('Should have the created state', function() {
      assert(history['$history']['prop']['state'] === 'created')
    })
  })

  describe('With 2 stages', function() {
    var stages = [
      { name: 'first', unchanged: 'same', deleted: 'hello', $meta: { commit: '1' } },
      { name: 'second', unchanged: 'same', $meta: { commit: '2' } }
    ]

    var history = historyGenerator(stages)

    it('Should have the last value', function() {
      assert(history.name === 'second')
    })

    it('Should have the last commit details', function() {
      assert(history['$history'].name.last.commit === '2')
    })

    it('Should not contain the deleted value', function() {
      assert(!history.deleted)
    })

    it('Should not contain deleted history', function() {
      assert(!history['$history'].deleted)
    })

    it('Should have the modified state', function() {
      assert(history['$history'].name.state === 'modified')
    })

    it('Should have the original state if not changed', function() {
      assert(history['$history'].unchanged.state === 'created', 'State should be created not:' + history['$history'].unchanged.state)
    })
  })

  describe('With sub objects', function() {
    var stages = [
      { obj: { name: 'first' }, $meta: { commit: '1' } },
      { obj: { name: 'second' }, $meta: { commit: '2' } }
    ]

    var history = historyGenerator(stages)

    it('Should have the correct value', function() {
      assert(history.obj.name === 'second')
    })

    it('Should have the correct history', function() {
      assert.value(history.obj['$history'].name.last.commit, '2', 'incorrect commit details', history.obj['$history'])
    })
  })

  describe('When generating first history', function() {
    let stages = [
      { $meta: 'commit', arr: [] }
    ]

    let graph = historyGenerator(stages)

    it('Should contain an empty array', function() {
      assert.value(graph.arr.length, 0)
    })

    it('An array should have the correct meta', function() {
      assert.value(graph['$history'].arr.last, 'commit')
    })

    it('An array should have the correct state', function() {
      assert.value(graph['$history'].arr.state, 'created')
    })
  })

  describe('When generating two histories', function() {
    let stages = [
      { $meta: '1', arr: [] },
      { $meta: '2', arr: ['item'] }
    ]

    let graph = historyGenerator(stages)

    it('It should have an array with the correct length', function() {
      assert.value(graph.arr.length, 1)
    })

    it('An array should have the correct meta', function() {
      assert.value(graph['$history'].arr.last, '2', 'incorrect meta', graph)
    })

    it('An array should have the correct state', function() {
      assert.value(graph['$history'].arr.state, 'modified')
    })

    it('Array item has correct history ', function() {
      assert.value(graph.arr['$history'][0].last, '2')
    })

    it('Array item has correct state', function() {
      assert.value(graph.arr['$history'][0].state, 'created')
    })
  })

  describe('With simple arrays', function() {
    let stages = [
      { arr: [], change: ['first'], insert: ['first'], del: ['first'], $meta: '1' },
      { arr: ['added'], change: ['second'], insert: ['second', 'first'], del: [], newArr: [], $meta: '2' }
    ]

    let graph = historyGenerator(stages)

    it('should contin correct array', function() {
      assert(graph.arr[0] === 'added')
    })

    it('Should have the overall state modified', function() {
      assert.value(graph['$history'].arr.state, 'modified', 'incorrect array state', graph)
    })

    it('Should have the item state created', function() {
      assert(graph.arr['$history'][0].state === 'created', graph.arr['$history'][0].state)
    })

    it('Should have the changed value', function() {
      assert(graph.change[0] === 'second', graph.change[0])
    })

    it('Should have the item state modified', function() {
      assert(graph.change['$history'][0].state === 'modified', graph.change['$history'][0].state)
    })

    it('Should handle insert', function() {
      assert.value('second', graph.insert[0], 'should have correct first value')
      assert.value('first', graph.insert[1], 'should have correct second value')
      assert.value('modified', graph['$history'].insert.state, 'should have correct array state')
      assert.value('modified', graph.insert['$history'][0].state, 'should have correct first item state')
      assert.value('created', graph.insert['$history'][1].state, 'should have correct second item state')
    })

    it('Should contain status for new array', function() {
      assert(graph['$history'].newArr.state === 'created')
    })
  })

  describe('With complex arrays', function() {
    let stages = [
      { $meta: '1', arr: [{ name: 'first' }] },
      { $meta: '2', arr: [{ name: 'second' }] }
    ]

    let graph = historyGenerator(stages)

    it('Should contain the correct data', function() {
      assert(graph.arr[0].name === 'second')
    })

    it('Should have the correct state', function() {
      assert.value('modified', graph['$history'].arr.state, 'should have correct array state', graph['$history'].arr.state)
    })

    it('should have correct child property meta', function() {
      assert.value('2', graph.arr[0]['$history'].name.last)
    })

    it('should have correct child property state', function() {
      assert.value('modified', graph.arr[0]['$history'].name.state)
    })

    it('Should have the correct array item state', function() {
      assert.value(graph.arr['$history'][0].state, 'modified')
    })
  })
})
