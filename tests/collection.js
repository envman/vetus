var assert = require('./assert')
var fs = require('fs')
var path = require('path')
var rimraf = require('rimraf').sync
var testDirectory = path.join(__dirname, '..', '..', 'test-temp')

var vetus = require('./../app')({ path: testDirectory })
var framework = new require('./test-framework')

describe('When using a collection', function() {

  var data

  before(function(done) {
    if (fs.existsSync(testDirectory)) {
      rimraf(testDirectory)
    }
    fs.mkdirSync(testDirectory)

    var data1 = {
      first: { name: 'first' },
      original: { name: 'not updated' },
      deleted: { fun: 'oh no' }
    }

    var data2 = {
      first: { name: 'updated' },
      original: { name: 'not updated' },
      second: { test: 'fun' }
    }

    framework.collection({name: 'test'})
      .then(c => framework.save(c, data1))
      .then(c => framework.save(c, data2))
      .then(c => framework.collection({name: 'test'}))
      .then(c => framework.load(c))
      .then(c => data = c.data)
      .nodeify(done)
  })

  after(function() {
    rimraf(testDirectory)
  })

  it('Should load the correct data from the first commit', function() {
    assert.value(data.original.name, 'not updated', 'Incorrect data loaded', data)
  })

  it('Should have added properties', function() {
    assert.value(data.second.test, 'fun', 'Incorrect data loaded', data)
  })

  it('Should have updated properties', function() {
    assert.value(data.first.name, 'updated', 'Incorrect data loaded', data)
  })

  it('should not have deleted properties', function() {
    assert(!data.deleted, 'Incorrect data loaded')
  })
})
