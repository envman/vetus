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

    framework.collection({name: 'test'})
      .then(c => c.data.first = {name: 'first'})
      .then(c => c.save('commit'))
      .then(c => framework.collection({name: 'test', user: 'rob'}))
      .then(c => c.load())
      .then(c => testData = c.collection.data)
      .then(c => done())

    vetus.collection({name: 'test'}, function(saveCollection) {
      saveCollection.data.first = {name: 'first'}
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
