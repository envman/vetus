var assert = require('chai').assert
var fs = require('fs')
var path = require('path')
var rimraf = require('rimraf').sync

var testDirectory = path.join(__dirname, '..', '..', 'test-temp')

var vetus = require('./../app')({ path: testDirectory })
var framework = new require('./test-framework')

describe('Load from a collection', function() {

  this.timeout(15000)
  var testData

  before(function(done) {
    if (fs.existsSync(testDirectory)) {
      rimraf(testDirectory)
    }

    fs.mkdirSync(testDirectory)

    var data = {
      first: { name: 'first' },
      second: { name: 'second' }
    }

    framework.collection({})
      .then(c => framework.save(c, data))
      .then(c => framework.load({}))
      .then(c => testData = c.data)
      .then(c => done())
  })

  after(function() {
    rimraf(testDirectory)
  })

  it('Files loaded', function(done) {
    assert(testData.first.name && testData.second.name)
    done()
  })

  it('Files contain correct data', function(done) {
    assert(testData.first.name === 'first' && testData.second.name === 'second')
    done()
  })
})
