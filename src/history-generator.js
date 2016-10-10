var clone = require('clone')

let getProperties = function(obj) {
  return Object.getOwnPropertyNames(obj)
    .filter(p => !p.startsWith('$'))
    .filter(p => !(Array.isArray(obj) && p === 'length'))
}

// MAY NEED ADDITONAL HISTORY AT TOP LEVEL
// MAY BE ABLE TO REMOVE OLD PASSING AND JUST PASS EXISTING GRAPH

let historyGenerator = function(stages, graph) {
  for (let stage of stages) {
    var newGraph = clone(stage)
    processStage(graph, stage, newGraph, stage['$meta'])
    graph = newGraph
  }

  delete graph['$meta']
  return graph
}

let processStage = function(old, node, graph, meta) {
  let state = null

  if (typeof(node) === 'object') {
    let history = {}

    for (let prop of getProperties(node)) {
      let propState = processStage(old && old[prop], node[prop], graph[prop], meta)
      history[prop] = old && old['$history'][prop] || { state: 'created', last: meta }

      if (propState) {
          history[prop] = { state: propState, last: meta }

          if (old) {
              state = 'modified'
          }
      }

      if (old && getProperties(old).toString() != getProperties(node)) {
        state = 'modified'
      }
    }

    graph['$history'] = history
  } else {
    if (node !== old) {
      state = 'modified'

      if (!old) {
        state = 'created'
      }
    }
  }

  return state
}

module.exports = historyGenerator
