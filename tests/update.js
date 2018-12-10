let assert = require('chai').assert
let fs = require('fs')
let path = require('path')
let rimraf = require('rimraf').sync

let testDirectory = path.join(__dirname, '..', '..', 'test-temp')

let framework = new require('./test-framework')

describe('Updating a collection', function() {

  let testData

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
      .then(c => testData = c.data)
      .then(c => done())
  })

  after(function() {
    rimraf(testDirectory)
  })

  it('File updated & committed correctly', function(done) {
    assert(testData.first.name === 'updated')
    done()
  })
})
