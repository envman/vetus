var assert = require('chai').assert
var fs = require('fs')
var path = require('path')
var rimraf = require('rimraf').sync

var testDirectory = path.join(__dirname, '..', 'test-temp')

var vetus = require('./../app')({ path: testDirectory })

describe('Create a new user', function() {

  before(function(done) {
    if (!fs.existsSync(testDirectory)) {
      fs.mkdirSync(testDirectory)
    }

    vetus.collection({name: 'test', user: 'John'}, function(collection) {
      collection.data.first = { name: 'first' }
      collection.data.second = { name: 'second' }

      collection.save('commit', function(err) {
        done()
      })
    })
  })

  after(function() {
    //rimraf(testDirectory)
  })

  var barerepoPath = path.join(testDirectory, 'test\\__bare')
  var userrepoPath = path.join(testDirectory, 'test\\John')
  var gitFolderPath = path.join(userrepoPath, '\\.git')

  it('Bare directory should exist', function(done) {
    fs.lstat(barerepoPath, function(lstatErr, stats) {
      assert(stats.isDirectory(), 'Directory ' + barerepoPath + ' does not exist')
      done()
    })
  })

  it('User directory should exist', function(done) {
    fs.lstat(userrepoPath, function(lstatErr, stats) {
      assert(stats.isDirectory(), 'Directory ' + userrepoPath + ' does not exist')
      done()
    })
  })

  it('User should have a git repo', function(done) {
    fs.lstat(gitFolderPath, function(lstatErr, stats) {
      assert(stats.isDirectory(), 'Directory ' + gitFolderPath + ' does not exist')
      done()
    })
  })
})
