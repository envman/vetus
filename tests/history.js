var assert = require('chai').assert
var fs = require('fs')
var path = require('path')
var rimraf = require('rimraf').sync

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

    vetus.collection({name: 'test'}, function(saveCollection) {
      saveCollection.data.first = { name: 'created', other: 'created', stringToObj: 'created' }
      saveCollection.save('commit', function(err) {
        saveCollection.data.first = { other: 'updated', stringToObj: { name: 'created'} }
        saveCollection.data.second = { name: { old : "old" } }
        saveCollection.save('commit2', function(err) {
          vetus.collection({name: 'test', user:'jamie'}, function(userCollection) {
            userCollection.data.second = { name: 'updated' }
            userCollection.save('commit3' ,function(err) { 
              userCollection.history(function(history) {
                historyObj = history
                done()       
              })        
            })
          })
        })
      })
    })
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
    assert(historyObj.first.name == 'created', "Not created")
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
    assert(historyObj.first.$hist_name.includes('_default'), "Failed default commits")
    assert(historyObj.second.$hist_name.includes('jamie'), "Failed user commits")
    done()
  })
})
