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
      saveCollection.data.test = { name: 'hello' }
      saveCollection.data.second = { name: 'second' }

      saveCollection.save('commit', function(err) {

        vetus.collection({name: 'test'}, function(collection) {

          collection.load(function() {
            testData = collection.data.test

            done()
          })
        })
      })
    })
  })

  after(function() {
    rimraf(testDirectory)
  })

  var repoPath = path.join(testDirectory, 'test')
  var gitFolderPath = path.join(repoPath, '.git')
  var testFilePath = path.join(repoPath, 'test.json')
  var secondFilePath = path.join(repoPath, 'second.json')

  it('File 1 loaded correctly', function(done) {
    assert(testData.name === 'hello')
    done()
  })

})
