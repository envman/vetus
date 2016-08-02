var assert = require('chai').assert
var fs = require('fs')
var path = require('path')
var rimraf = require('rimraf').sync

var testDirectory = path.join(__dirname, '..', '..', 'test-temp')

var vetus = require('./../app')({ path: testDirectory })

describe('When multiple users are using the system', function() {

  var testData

  before(function(done) {
    if (fs.existsSync(testDirectory)) {
      rimraf(testDirectory)
    }

    fs.mkdirSync(testDirectory)

    vetus.collection({name: 'test'}, function(saveCollection) {
      saveCollection.data.first = { name: 'first' }
      saveCollection.save('commit', function(err) {

        vetus.collection({name: 'test', user: 'rob'}, function(collection) {

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

  it('Files contain correct data', function(done) {
    assert(testData.first.name === 'first')
    done()
  })
})
