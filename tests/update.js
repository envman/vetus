var assert = require('chai').assert
var fs = require('fs')
var path = require('path')
var rimraf = require('rimraf').sync

var testDirectory = path.join(__dirname, '..', '..', 'test-temp')

var vetus = require('./../app')({ path: testDirectory })
var framework = new require('./test-framework')()

describe('Updating a collection', function() {

  var testData

  before(function(done) {
    if (fs.existsSync(testDirectory)) {
      rimraf(testDirectory)
    }

    fs.mkdirSync(testDirectory)

    var input = {
      data: {
        first: {name: 'first'}
      }
    }

    framework.saveThenLoad(input, function(collection) {
      collection.data.first = { name: 'updated' }
      collection.save('commit', function(err) {

       vetus.collection({name: 'test'}, function(updatedCollection) {
          updatedCollection.load(function() {
            testData = updatedCollection.data
            done()
          })
        })
      })
    })
  })

  after(function() {
    rimraf(testDirectory)
  })

  it('File updated & committed correctly', function(done) {
    assert(testData.first.name === 'updated')
    done()
  })
})
