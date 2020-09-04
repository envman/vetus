const assert = require('chai').assert
const fs = require('fs')
const path = require('path')
const rimraf = require('rimraf').sync

const testDirectory = path.join(__dirname, '..', '..', 'test-temp')

const framework = new require('./test-framework')

describe('(Basic) Merging', function() {

  let masterData

  before(function(done) {
    if (fs.existsSync(testDirectory)) {
      rimraf(testDirectory)
    }

    fs.mkdirSync(testDirectory)

    let data1 = { first: { name : 'first' } }
    let data2 = { first: { name : 'updated' } }

    framework.collection({name: 'test'})
      .then(c => framework.save(c, data1))
      .then(c => framework.createBranch(c, 'dev'))
      .then(c => framework.save(c, data2))
      .then(() => framework.collection({name: 'test'}))
      .then(c => framework.merge(c, 'dev'))
      .then(c => framework.load(c))
      .then(c => masterData = c.data)
      .then(() => done())
  })

  after(function() {
    rimraf(testDirectory)
  })

  it('Dev and Master merged successfully', function(done) {
    assert(masterData.first.name === 'updated')
    done()
  })
})
