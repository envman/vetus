let assert = require('chai').assert
let fs = require('fs')
let path = require('path')
let rimraf = require('rimraf').sync

let testDirectory = path.join(__dirname, '..', '..', 'test-temp')
let framework = new require('./test-framework')

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
