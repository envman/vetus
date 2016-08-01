var path = require('path')

var Collection = require('./src/collection')

module.exports = function(settings) {

  return {
    collection: function(options, callback) {
      var root = path.join(settings.path, options.name)

      callback(new Collection({path: root}))
    }
  }
}
