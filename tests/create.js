var assert = require('chai').assert
var fs = require('fs')
var path = require('path')
var rimraf = require('rimraf').sync

var testDirectory = path.join(__dirname, '..', 'test-temp')

var vetus = require('./../app')({ path: testDirectory })

describe('Create a new collection', function() {

  before(function(done) {
    if (fs.existsSync(testDirectory)) {
      rimraf(testDirectory)
    }

    fs.mkdirSync(testDirectory)

    vetus.collection({name: 'test', user: 'name'}, function(collection) {
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
  var gitFolderPath = path.join(repoPath, '.git')
  var testFilePath = path.join(repoPath, 'first.json')
  var secondFilePath = path.join(repoPath, 'second.json')

  it('Directory should exist', function(done) {
    fs.lstat(repoPath, function(lstatErr, stats) {
      assert(stats.isDirectory(), 'Directory ' + repoPath + ' does not exist')
      done()
    })
  })

  it('File should exist', function(done) {
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

  it('Should be a git repository', function(done) {
    fs.lstat(gitFolderPath, function(lstatErr, stats) {
      assert(stats.isDirectory(), 'Directory ' + gitFolderPath + ' does not exist')
      done()
    })
  })

  it('Should have committed the files', function(done) {
    var Repository = require('./../src/repository')
    var repo = new Repository(repoPath)

    repo.clean(function() {
      fs.exists(testFilePath, function(exists) {
        assert(exists, 'path ' + testFilePath + ' does not exist')
        done()
      })
    })
  })
})
