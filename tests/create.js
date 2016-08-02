var assert = require('chai').assert
var fs = require('fs')
var path = require('path')
var rimraf = require('rimraf').sync

var testDirectory = path.join(__dirname, '..', '..', 'test-temp')

var vetus = require('./../app')({ path: testDirectory })

describe('Create a new collection', function() {

  before(function(done) {
    if (fs.existsSync(testDirectory)) {
      rimraf(testDirectory)
    }

    fs.mkdirSync(testDirectory)

    vetus.collection({name: 'test'}, function(collection) {
      collection.data.first = { name: 'first' }
      collection.data.second = { name: 'second' }

      collection.save('commit', function(err) {
        done()
      })
    })
  })

  after(function() {
    rimraf(testDirectory)
  })

  var repoPath = path.join(testDirectory, 'test')
  var barerepoPath = path.join(repoPath, '_bare')
  var userrepoPath = path.join(repoPath, '_default')
  var gitFolderPath = path.join(userrepoPath, '.git')
  var testFilePath = path.join(userrepoPath, 'first.json')
  var secondFilePath = path.join(userrepoPath, 'second.json')

  it('Base directory should exist', function(done) {
    fs.lstat(repoPath, function(lstatErr, stats) {
      assert(stats.isDirectory(), 'Directory ' + repoPath + ' does not exist')
      done()
    })
  })

  it('Bare directory should exist', function(done) {
    fs.lstat(path.join(barerepoPath, 'info'), function(lstatErr, stats) {
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

  it('First file exists', function(done) {
    fs.exists(testFilePath, function(exists) {
      assert(exists, 'path ' + testFilePath + ' does not exist')
      done()
    })
  })

  it('Second file exists', function(done) {
    fs.exists(secondFilePath, function(exists) {
      assert(exists, 'path ' + secondFilePath + ' does not exist')
      done()
    })
  })

  it('File contains correct data', function(done) {
    fs.readFile(testFilePath, 'utf-8', function(readErr, file) {
      var obj = JSON.parse(file)
      assert(obj.name === 'first')
      done()
    })
  })

  it('Default user should contain a git repo', function(done) {
    fs.lstat(gitFolderPath, function(lstatErr, stats) {
      assert(stats.isDirectory(), 'Directory ' + gitFolderPath + ' does not exist')
      done()
    })
  })

  it('Should have committed the files', function(done) {
    var Repository = require('./../src/repository')
    var repo = new Repository(userrepoPath)

    repo.clean(function() {
      fs.exists(testFilePath, function(exists) {
        assert(exists, 'path ' + testFilePath + ' does not exist')
        done()
      })
    })
  })
})
