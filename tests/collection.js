let assert = require('./assert')
let fs = require('fs')
let path = require('path')
let rimraf = require('rimraf').sync
let testDirectory = path.join(__dirname, '..', '..', 'test-temp')

let framework = new require('./test-framework')

describe('When using a collection', function() {

  let data

  before(function(done) {
    if (fs.existsSync(testDirectory)) {
      rimraf(testDirectory)
    }
    fs.mkdirSync(testDirectory)

    let data1 = {
      first: { name: 'first' },
      original: { name: 'not updated' },
      deleted: { fun: 'oh no' }
    }

    let data2 = {
      first: { name: 'updated' },
      original: { name: 'not updated' },
      second: { test: 'fun' }
    }

    framework.collection({name: 'test'})
      .then(c => framework.save(c, data1))
      .then(c => framework.save(c, data2))
      .then(() => framework.collection({name: 'test'}))
      .then(c => framework.load(c))
      .then(c => data = c.data)
      .nodeify(done)
  })

  after(function() {
    rimraf(testDirectory)
  })

  it('Should load the correct data from the first commit', function() {
    assert.value(data.original.name, 'not updated', 'Incorrect data loaded', data)
  })

  it('Should have added properties', function() {
    assert.value(data.second.test, 'fun', 'Incorrect data loaded', data)
  })

  it('Should have updated properties', function() {
    assert.value(data.first.name, 'updated', 'Incorrect data loaded', data)
  })

  it('should not have deleted properties', function() {
    assert(!data.deleted, 'Incorrect data loaded')
  })
})
