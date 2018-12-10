let path = require('path')
let fs = require('fs')

let Collection = require('./src/collection')

module.exports = function(settings) {

  return {
    collection: function(options, callback) {
      // console.log(`Collection: ${options.name} - ${options.user} - ${options.branch}`)

      let root = path.join(settings.path, options.name)

      fs.exists(root, function(exists) {
        let collection = new Collection({path: root, user: options.user, branch: options.branch})
        collection.exists = exists

        callback(collection)
      })
    }
  }
}
