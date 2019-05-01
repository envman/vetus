const assert = require('chai').assert
const fs = require('fs')
const path = require('path')
const rimraf = require('rimraf').sync

const testDirectory = path.join(__dirname, '..', '..', 'test-temp')

const framework = new require('./test-framework')

describe('Updating a collection', function() {

  let testData
  let commit

  before(function(done) {
    if (fs.existsSync(testDirectory)) {
      rimraf(testDirectory)
    }

    fs.mkdirSync(testDirectory)

    let data = {
      first: {name: 'first'}
    }

    let updated = {
      first: {name: 'updated'}
    }

    framework.collection()
      .then(c => framework.save(c, data))
      .then(c => framework.load(c))
      .then(c => framework.save(c, updated))
      .then(c => framework.load(c))
      .then(c => {
        testData = c.data
        commit = c.commit
      })
      .then(c => done())
  })

  after(function() {
    rimraf(testDirectory)
  })

  it('File updated & committed correctly', function(done) {
    assert(testData.first.name === 'updated')
    assert(commit.length > 0)
    done()
  })
})
