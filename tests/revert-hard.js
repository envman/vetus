const assert = require('chai').assert
const fs = require('fs')
const path = require('path')
const rimraf = require('rimraf').sync

const testDirectory = path.join(__dirname, '..', '..', 'test-temp')

const framework = new require('./test-framework')

describe('Revert Hard', () => {

  let masterData
  let data1 = { first: { name : 'first' } }

  before(done => {
    if (fs.existsSync(testDirectory)) {
      rimraf(testDirectory)
    }

    fs.mkdirSync(testDirectory)

    let data2 = { first: { name : 'updated' } }

    framework.collection({name: 'test'})
      .then(c => framework.save(c, data1))
      .then(c => framework.save(c, data2))
      .then(c => framework.revertHard(c))
      .then(c => framework.load(c))
      .then(c => masterData = c.data)
      .then(() => done())
  })

  after(function() {
    rimraf(testDirectory)
  })

  it('masterData should equal to data1', done => {
    assert(JSON.stringify(masterData) === JSON.stringify(data1))
    done()
  })
})
