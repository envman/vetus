let assert = require('chai').assert
let fs = require('fs')
let path = require('path')
let rimraf = require('rimraf').sync

let testDirectory = path.join(__dirname, '..', '..', 'test-temp')

let framework = new require('./test-framework')

describe('When a branch is deleted in a collection', function() {

  let branches
  let otherUserBranches

  before(function(done) {
    if (fs.existsSync(testDirectory)) {
      rimraf(testDirectory)
    }

    fs.mkdirSync(testDirectory)

    framework.collection({name: 'test'})
      .then(c => framework.save(c, { prop: { test: 'hello' } }))
      .then(c => framework.createBranch(c, 'new_branch'))
      .then(() => framework.collection({name: 'test', user: 'first', branch: 'new_branch'}))
      .then(c => framework.load(c))
      .then(() => framework.collection({name: 'test'}))
      .then(c => framework.load(c))
      .then(c => framework.deleteBranch(c, 'new_branch'))
      .then(c => framework.branchList(c))
      .then(d => branches = d.list)
      .then(() => framework.collection({name: 'test', user: 'second'}))
      .then(c => framework.branchList(c))
      .then(d => otherUserBranches = d.list)
      .then(() => done())
  })

  after(function() {
    rimraf(testDirectory)
  })

  it('It is no longer in the branch list', function() {
    assert(branches.filter(b => b == 'new_branch').length == 0, 'Branch Not Deleted')
  })

  it('other user cannot see branch', function() {
    assert(otherUserBranches.filter(b => b == 'new_branch').length == 0, 'Branch Not Deleted for second user')
  })
})
