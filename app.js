var path = require('path')
var fs = require('fs')

var Collection = require('./src/collection')

module.exports = function(settings) {

  return {
    collection: function(options, callback) {
      console.log(`Collection: ${options.name} - ${options.user} - ${options.branch}`)

      var root = path.join(settings.path, options.name)

      fs.exists(root, function(exists) {
        var collection = new Collection({path: root, user: options.user, branch: options.branch})
        collection.exists = exists

        callback(collection)
      })
    }
  }
}
