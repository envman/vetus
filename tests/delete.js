var assert = require('chai').assert
var fs = require('fs')
var path = require('path')
var rimraf = require('rimraf').sync

var testDirectory = path.join(__dirname, '..', '..', 'test-temp')

var vetus = require('./../app')({ path: testDirectory })
var framework = new require('./test-framework')

describe('Delete branch from a collection', function() {

  var branches

  before(function(done) {
    if (fs.existsSync(testDirectory)) {
      rimraf(testDirectory)
    }

    fs.mkdirSync(testDirectory)

    var data1 = {
      first: { name: 'first' },
    }

    var data2 = {
      first: { name: 'first', other: 'some' }
    }

    framework.collection({name: 'test'})
      .then(c => framework.save(c, { prop: {} }))
      .then(c => framework.createBranch(c, 'new_branch'))
      .then(c => framework.collection({name: 'test'}))
      .then(c => framework.load(c))
      .then(c => framework.deleteBranch(c, 'new_branch'))
      .then(c => framework.branchList(c))
      .then(d => branches = d.list)
      .then(c => done())
  })

  after(function() {
    rimraf(testDirectory)
  })

  it('Branch deleted', function() {
    assert(branches.filter(b => b == 'new_branch').length == 0, 'Branch Not Deleted')
  })
})
