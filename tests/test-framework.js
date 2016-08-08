var path = require('path')
var testDirectory = path.join(__dirname, '..', '..', 'test-temp')

var vetus = require('./../app')({ path: testDirectory })

module.exports = function() {

  var saveThenLoad = function(data, callback) {

    vetus.collection({name: 'test'}, function(saveCollection) {
      saveCollection.data = data.data

      saveCollection.save('commit', function(err) {

        var input = {
          name: 'test'
        }
        if (data.user) {
          input.user = data.user
        }

        vetus.collection({name: 'test', user:'jamie'}, function(collection) {
          collection.load(function() {
            testData = collection.data

            callback(collection)
          })
        })
      })
    })
  }

  var save = function(data, callback) {
    vetus.collection({name: 'test'}, function(collection) {

      collection.data = data.data

      collection.save('commit', function(err) {
        callback()
      })
    })
  }

  return {
    save: save,
    saveThenLoad: saveThenLoad
  }
}
