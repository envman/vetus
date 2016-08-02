var path = require('path')
var fs = require('fs')

var Collection = require('./src/collection')

module.exports = function(settings) {

  return {
    collection: function(options, callback) {
      var root = path.join(settings.path, options.name)

      fs.exists(root, function(exists) {
        var collection = new Collection({path: root, user: options.user})
        collection.exists = exists

        callback(collection)
      })
    }
  }
}
