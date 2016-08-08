var assert = require('chai').assert
var fs = require('fs')
var path = require('path')
var rimraf = require('rimraf').sync

var testDirectory = path.join(__dirname, '..', '..', 'test-temp')

var vetus = require('./../app')({ path: testDirectory })

describe('(Basic) Merging', function() {

  var branchData
  var masterData
  var masterLog

  before(function(done) {
    if (fs.existsSync(testDirectory)) {
      rimraf(testDirectory)
    }

    fs.mkdirSync(testDirectory)

    vetus.collection({name: 'test'}, function(saveCollection) {
      saveCollection.data.first = { name: 'first' }
      saveCollection.save('added first', function(err) {
        vetus.collection({name: 'test', branch: 'dev'}, function(collection) {
          collection.load(function() {
            collection.data.first = { name: 'updated' }
            collection.save('updated first in dev', function(err) {
              saveCollection.load(function() {
                saveCollection.data.second = { name: 'second' }
                saveCollection.save('added second to master', function(err) {
                  collection.merge('master', function(err) {
                    vetus.collection({name: 'test', branch:'dev'}, function(branchCollection) {
                      branchCollection.load(function() {
                        branchData = branchCollection.data
                        vetus.collection({name: 'test'}, function(masterCollection) {
                          masterCollection.load(function() {
                            masterData = masterCollection.data
                            masterCollection.getHistory('-p -5', function(log) {
                              masterLog = log
                              // console.log(masterLog)
                              done()
                            })
                          })
                        })
                      })
                    })
                  })
                })
              })
            })
          })
        })
      })
    })
  })

  after(function() {
    rimraf(testDirectory)
  })

  it('Dev and Master merged successfully', function(done) {
    assert(masterData.first.name === branchData.first.name)
    done()
  })

  it('Master keeps changes', function(done) {
    assert(masterData.second.name)
    done()
  })

  it('Dev has not changed', function(done) {
    assert(!branchData.second)
    done()
  })

  it('Log succeeded', function(done) {
    assert(masterLog)
    done()
  })
})
