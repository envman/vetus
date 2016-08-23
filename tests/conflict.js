var assert = require('./assert')
var fs = require('fs')
var path = require('path')
var rimraf = require('rimraf').sync

var testDirectory = path.join(__dirname, '..', '..', 'test-temp')

var vetus = require('./../app')({ path: testDirectory })
var framework = require('./test-framework')

describe('(Basic) Conflicts', function() {

  var branchData
  var masterData

  before(function(done) {
    if (fs.existsSync(testDirectory)) {
      rimraf(testDirectory)
    }

    fs.mkdirSync(testDirectory)

    var data1 = {
      first: { name: 'first' }
    }

    var data2 = {
      first: { name: 'updated' }
    }

    var data3 = {
      first: { name: 'conflict' },
      second: { name: 'second' }
    }

    framework.collection({name: 'test'})
      .then(c => framework.save(c, data1))
      .then(c => framework.createBranch(c, 'dev'))
      .then(c => framework.)

    framework.collection({name: 'test'})
      .then(c => framework.save(c, data1))
      .then(c => framework.createBranch(c, 'dev'))
      .then(c => framework.save(c, data2))
      .then(c => framework.save(c, data3))
      .then(c => framework.merge(c, 'master'))
      .then(c => framework.collection({name: 'test', branch: 'dev'}))
      .then(c => framework.load(c))
      .then(c => branchData = c.data)
      .then(c => framework.collection({name: 'test'}))
      .then(c => framework.load(c))
      .then(c => masterData = c.data)
      .then(c => done())

    // vetus.collection({name: 'test'}, function(saveCollection) {
    //   saveCollection.data.first = { name: 'first' }
    //   saveCollection.save('commit', function(err) {
    //     saveCollection.createBranch('dev', function() {
    //       vetus.collection({name: 'test', branch: 'dev'}, function(collection) {
    //         collection.load(function() {
    //           collection.data.first = { name: 'updated' }
    //           collection.save('commit', function(err) {
    //             saveCollection.load(function() {
    //               saveCollection.data.first = { name: 'conflict' }
    //               saveCollection.data.second = { name: 'second' }
    //               saveCollection.save('commit2', function(err) {
    //                 collection.merge('master', function(err) {
    //                   vetus.collection({name: 'test', branch: 'dev'}, function(branchCollection) {
    //                     branchCollection.load(function() {
    //                       branchData = branchCollection.data
    //                       vetus.collection({name: 'test'}, function(masterCollection) {
    //                         masterCollection.load(function() {
    //                           masterData = masterCollection.data
    //                           done()
    //                         })
    //                       })
    //                     })
    //                   })
    //                 })
    //               })
    //             })
    //           })
    //         })
    //       })
    //     })
    //   })
    // })
  })

  // after(function() {
  //   rimraf(testDirectory)
  // })

  it('Dev and Master not merged', function(done) {
    assert(masterData.first.name !== branchData.first.name)
    done()
  })
  it('Master keeps changes', function(done) {
    assert(masterData.second.name, 'incorrect value')
    done()
  })
  it('Dev has not changed', function(done) {
    assert(!branchData.second, 'incorrect value: ' + branchData.second.name)
    done()
  })
})
