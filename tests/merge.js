var assert = require('chai').assert
var fs = require('fs')
var path = require('path')
var rimraf = require('rimraf').sync

var testDirectory = path.join(__dirname, '..', '..', 'test-temp')

var vetus = require('./../app')({ path: testDirectory })
var framework = new require('./test-framework')

describe('(Basic) Merging', function() {

  // var branchData
  var masterData
  var masterLog

  before(function(done) {
    if (fs.existsSync(testDirectory)) {
      rimraf(testDirectory)
    }

    fs.mkdirSync(testDirectory)

    var data1 = { first: { name : 'first' } }
    var data2 = { first: { name : 'updated' } }

    framework.collection({name: 'test'})
      .then(c => framework.save(c, data1))
      .then(c => framework.createBranch(c, 'dev'))
      .then(c => framework.save(c, data2))
      .then(c => framework.collection({name: 'test'}))
      .then(c => framework.merge(c, 'dev'))
      .then(c => framework.load(c))
      .then(c => masterData = c.data)
      .then(c => done())
  })

  after(function() {
    rimraf(testDirectory)
  })

  it('Dev and Master merged successfully', function(done) {
    assert(masterData.first.name === 'updated')
    done()
  })
})
