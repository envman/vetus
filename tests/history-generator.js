var assert = require('chai').assert
// var historyGenerator = require('./../src/history-generator')

let getProperties = function(obj) {
  return Object.getOwnPropertyNames(obj)
    .filter(p => !p.startsWith('$'))
}

let getState = function(stage, graph) {
  if (!graph) {
    return 'created'
  } else if (graph !== stage) {
    return 'modified'
  }
}

let historyGenerator = function(stages, graph) {
  for (let stage of stages) {
    graph = processStage(stage, graph, stage['$meta'])
  }

  return graph
}

let processStage = function(stage, graph, meta) {
  graph = graph || {}
  let history = graph['$history'] = graph['$history'] || {}

  for (let prop of getProperties(stage)) {
    if (typeof(stage[prop]) === 'object') {

      let objHistory = graph[prop] && graph[prop]['$history']
      graph[prop] = processStage(stage[prop], objHistory, meta)
    } else {

      var state = getState(stage[prop], graph[prop])
      graph[prop] = stage[prop]

      if (state) {
        history[prop] = { last: meta, state: state }
      }
    }
  }

  for (let prop of getProperties(graph)) {
    if (!stage[prop]) {
      delete graph[prop]
      delete history[prop]
    }
  }

  return graph
}

// TODO:
// arrays (simple & object)
// change of type
// With a pre existing history passed (should work just needs tests)
// Add history modes (none, normal, full)

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
      assert(history.obj['$history'].name.last.commit === '2')
    })
  })
})
