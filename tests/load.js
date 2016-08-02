var assert = require('chai').assert
var fs = require('fs')
var path = require('path')
var rimraf = require('rimraf').sync

var testDirectory = path.join(__dirname, '..', 'test-temp')

var vetus = require('./../app')({ path: testDirectory })

describe('Load from a collection', function() {

  var testData

  before(function(done) {
    if (fs.existsSync(testDirectory)) {
      rimraf(testDirectory)
    }

    fs.mkdirSync(testDirectory)

    vetus.collection({name: 'test'}, function(saveCollection) {
      saveCollection.data.first = { name: 'first' }
      saveCollection.data.second = { name: 'second' }

      saveCollection.save('commit', function(err) {

        vetus.collection({name: 'test'}, function(collection) {

          collection.load(function() {
            testData = collection.data

            done()
          })
        })
      })
    })
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
