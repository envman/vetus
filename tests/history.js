var assert = require('./assert')
var fs = require('fs')
var path = require('path')
var rimraf = require('rimraf').sync
var framework = new require('./test-framework')

var testDirectory = path.join(__dirname, '..', '..', 'test-temp')

var vetus = require('./../app')({ path: testDirectory })

describe('Repository history testing', function() {

  var graph

  before(function(done) {
    if (fs.existsSync(testDirectory)) {
      rimraf(testDirectory)
    }

    fs.mkdirSync(testDirectory)

    let first = { name: 'first' }
    let second = { name: 'second' }

    framework.collection({ user: 'rob' })
      .then(c => framework.save(c, first))
      .then(c => framework.save(c, second))
      .then(c => framework.history(c))
      .then(h => graph = h)
      .then(c => done())
  })

  after(function() {
    rimraf(testDirectory)
  })

  it('Contains history', function() {
    assert(graph['$history'], "Missing history")
  })

  it('has correct value', function() {
    assert.value(graph.name, 'second')
  })

  it('has correct commit details', function() {
    assert.value(graph['$history'].name.last.author, 'rob <rob@vetus>')
  })
})
