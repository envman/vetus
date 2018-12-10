const assert = require('chai').assert
const fs = require('fs')
const path = require('path')
const rimraf = require('rimraf').sync

const testDirectory = path.join(__dirname, '..', '..', 'test-temp')
const framework = new require('./test-framework')

describe('When multiple users are using the system', function() {

  let testData

  before(function(done) {
    if (fs.existsSync(testDirectory)) {
      rimraf(testDirectory)
    }

    fs.mkdirSync(testDirectory)

    let data = {
      first: {
        name: 'first'
      }
    }

    framework.collection({name: 'test'})
      .then(c => framework.save(c, data))
      .then(() => framework.collection({name: 'test', user: 'rob'}))
      .then(c => framework.load(c))
      .then(c => testData = c.data)
      .then(() => done())
  })

  after(function() {
    rimraf(testDirectory)
  })

  it('Files contain correct data', function(done) {
    assert(testData.first.name === 'first')
    done()
  })
})
