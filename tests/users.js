var assert = require('chai').assert
var fs = require('fs')
var path = require('path')
var rimraf = require('rimraf').sync

var testDirectory = path.join(__dirname, '..', '..', 'test-temp')
var framework = new require('./test-framework')

var vetus = require('./../app')({ path: testDirectory })

describe('When multiple users are using the system', function() {

  var testData

  before(function(done) {
    if (fs.existsSync(testDirectory)) {
      rimraf(testDirectory)
    }

    fs.mkdirSync(testDirectory)

    var data = {
      first: {
        name: 'first'
      }
    }

    framework.collection({name: 'test'})
      .then(c => framework.save(c, data))
      .then(c => framework.collection({name: 'test', user: 'rob'}))
      .then(c => framework.load(c))
      .then(c => testData = c.data)
      .then(c => done())
  })

  after(function() {
    rimraf(testDirectory)
  })

  it('Files contain correct data', function(done) {
    assert(testData.first.name === 'first')
    done()
  })
})
