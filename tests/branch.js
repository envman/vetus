var assert = require('./assert')
var fs = require('fs')
var path = require('path')
var rimraf = require('rimraf').sync
var testDirectory = path.join(__dirname, '..', '..', 'test-temp')

var vetus = require('./../app')({ path: testDirectory })
var framework = new require('./test-framework')

describe('Branching tests', function() {

  var branchData
  var masterData
  var collection
  var list

  before(function(done) {
    if (fs.existsSync(testDirectory)) {
      rimraf(testDirectory)
    }

    fs.mkdirSync(testDirectory)

    var data1 = {
      first: { name: 'first' }
    }

    var data2 = {
      first: { name: 'updated' }
    }

    framework.collection({name: 'test'})
      .then(c => framework.save(c, data1))
      .then(c => framework.createBranch(c, 'dev'))
      .then(c => framework.save(c, data2))
      .then(c => framework.collection({name: 'test', branch: 'dev'}))
      .then(c => framework.load(c))
      .then(c => branchData = c.data)
      .then(c => framework.collection({name: 'test'}))
      .then(c => framework.load(c))
      .then(c => framework.branchList(c))
      .then(d => {list = d.list; masterData = d.collection.data})
      .nodeify(done)
  })

  after(function() {
    rimraf(testDirectory)
  })

  it('Master branch created successfully & unmodified', function(done) {
    assert(masterData.first.name === 'first', 'Incorrect value: ' + masterData.first.name)
    done()
  })

  it('Dev branch created and updated successfully', function(done) {
    assert.value(branchData.first.name, 'updated', 'incorrect dev value', branchData)
    done()
  })

  it('branch list contains first branch', function() {
    assert(list[0] === 'dev')
  })

  it('branch list contains second branch', function() {
    assert(list[1] === 'master')
  })

  it('should handle remote branches', function(done) {
    vetus.collection({name:'test', user: 'new-user'}, function(collection) {
      collection.branchList(function(list) {
        assert(list[0] == 'master')
        done()
      })
    })
  })
})
