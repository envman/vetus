var assert = require('./assert')
var fs = require('fs')
var path = require('path')
var rimraf = require('rimraf').sync
var framework = new require('./test-framework')

var testDirectory = path.join(__dirname, '..', '..', 'test-temp')

var vetus = require('./../app')({ path: testDirectory })

describe('Repository history testing', function() {

  var historyObj
  var firstHistory = "$hist_first"
  var secondHistory = "$hist_second"

  before(function(done) {
    if (fs.existsSync(testDirectory)) {
      rimraf(testDirectory)
    }

    fs.mkdirSync(testDirectory)

    var first = {
      first: { name: 'created', other: 'created', stringToObj: 'created' }
    }

    var second = {
      first: { other: 'updated', stringToObj: { name: 'created'} },
      second: { name: { old : "old" } }
    }

    var third = {
      second: { name: 'updated' }
    }

    framework.collection({})
      .then(c => framework.save(c, first))
      .then(c => framework.save(c, second))
      .then(c => framework.collection({user: 'jamie'}))
      .then(c => framework.save(c, third))
      .then(c => framework.load(c))
      .then(c => framework.history(c))
      .then(h => historyObj = h)
      .then(c => done())
  })

  after(function() {
    rimraf(testDirectory)
  })

  it('Contains history', function(done) {
    assert(historyObj[firstHistory], "Missing first history")
    assert(historyObj[secondHistory], "Missing second history")
    done()
  })

  it('First created & updated', function(done) {
    assert.value(historyObj.first.name,'created', "Not created", historyObj)
    assert(historyObj.first.other == 'updated', "Not updated")
    done()
  })

  it('Attribute converted, string -> obj', function(done) {
    assert((typeof historyObj.first.stringToObj) == 'object', "It didnt convert")
    done()
  })

  it('Attribute converted,  obj -> string', function(done) {
    assert((typeof historyObj.second.name) == 'string', "It didnt convert")
    done()
  })

  it('Multiple user history correct' ,function(done) {
    assert(historyObj.first.$hist_name.includes('_default'), "Failed default commits " + historyObj.first.$hist_name)
    assert(historyObj.second.$hist_name.includes('jamie'), "Failed user commits " + historyObj.second.$hist_name)
    done()
  })
})
