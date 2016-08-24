var assert = require('./assert')
var fs = require('fs')
var path = require('path')
var rimraf = require('rimraf').sync

var testDirectory = path.join(__dirname, '..', '..', 'playground')

var vetus = require('./../app')({ path: testDirectory })
var framework = require('./test-framework')

describe('(Basic) Conflicts', function() {

  var branchData
  var masterData

  before(function(done) {
    if (fs.existsSync(testDirectory)) {
      rimraf(testDirectory)
    }

    fs.mkdirSync(testDirectory)

    var data1 = {
      first: { name: 'first' }
    }

    var data2 = {
      first: { name: 'updated' },
      second: {name: 'second'}
    }

    var data3 = {
      first: { name: 'conflict' },
    }

    framework.collection({name: 'test'})
      .then(c => framework.save(c, data1))
      .then(c => framework.createBranch(c, 'dev'))
      .then(c => framework.save(c, data2))
      .then(c => framework.collection({name: 'test'}))
      .then(c => framework.save(c, data3))
      .then(c => framework.merge(c, 'dev'))
      .then(c => masterData = c.data)
      .then(c => framework.collection({name: 'test', branch: 'dev'}))
      .then(c => framework.load(c))
      .then(c => branchData = c.data)
      .then(c => done())
  })

  after(function() {
    rimraf(testDirectory)
  })

  it('Dev and Master not merged', function(done) {
    assert(masterData.first.name !== branchData.first.name)
    done()
  })
  it('Dev keeps changes', function(done) {
    assert(branchData.second.name, 'incorrect value')
    done()
  })
  it('Master has not changed', function(done) {
    assert(!masterData.second, 'incorrect value: ' + branchData.second.name)
    done()
  })
})
