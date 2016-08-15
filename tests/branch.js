var assert = require('chai').assert
var fs = require('fs')
var path = require('path')
var rimraf = require('rimraf').sync

var testDirectory = path.join(__dirname, '..', '..', 'test-temp')

var vetus = require('./../app')({ path: testDirectory })

describe('Branching tests', function() {

  var branchData
  var masterData
  var collection

  before(function(done) {
    if (fs.existsSync(testDirectory)) {
      rimraf(testDirectory)
    }

    fs.mkdirSync(testDirectory)

    vetus.collection({name: 'test'}, function(saveCollection) {
      saveCollection.data.first = { name: 'first' }
      saveCollection.save('commit', function(err) {
        saveCollection.createBranch('dev', function() {
          vetus.collection({name: 'test', branch: 'dev'}, function(collection2) {
            collection2.load(function() {
              collection2.data.first = { name: 'updated' }
              collection2.save('commit', function(err) {
               vetus.collection({name: 'test', branch:'dev'}, function(branchCollection) {
                  branchCollection.load(function() {
                    branchData = branchCollection.data
                    vetus.collection({name: 'test'}, function(masterCollection) {
                      masterCollection.load(function() {
                        masterData = masterCollection.data
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

  after(function() {
    rimraf(testDirectory)
  })

  it('Master branch created successfully & unmodified', function(done) {
    assert(masterData.first.name === 'first')
    done()
  })

  it('Dev branch created and updated successfully', function(done) {
    assert(branchData.first.name === 'updated')
    done()
  })

  it('branch list contains first branch', function(done) {
    vetus.collection({name: 'test'}, function(collection) {
      collection.branchList(function(list) {
        assert(list[0] === 'dev')
        done()
      })
    })
  })

  it('branch list contains second branch', function(done) {
    vetus.collection({name: 'test'}, function(collection) {
      collection.branchList(function(list) {
        assert(list[1] === 'master')
        done()
      })
    })
  })

  it('should handle remote branches', function(done) {
    vetus.collection({name:'test', user: 'new-user'}, function(collection) {
      collection.branchList(function(list) {
        done()
      })
    })
  })
})
