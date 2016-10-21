let Promise = require('bluebird')
let fs = require('fs')
let path = require('path')

let allFiles = function(root, obj) {
  obj = obj || {}

    return new Promise((fulfill, reject) => {
      fs.readdir(root, (err, files) => {
        let proms = files.map(f => checkFile(root, f, obj))

        Promise.all(proms)
          .then((a) => {
            fulfill(obj)
          })
      })
    })
}

let checkFile = function(root, file, obj) {
  return new Promise((fulfill, reject) => {
    fs.lstat(path.join(root, file), (err, stats) => {
      if (stats.isDirectory()) {
        if (file.startsWith('__')) {
          obj[filename(file)] = []

        } else {
          obj[file] = {}
        }

        allFiles(path.join(root, file), obj[filename(file)])
          .then(() => {
            fulfill(obj)
          })

      } else {
        fs.readFile(path.join(root, file), 'utf-8', function(err, data) {
          obj[filename(file)] = data.substring(0, data.length)
          fulfill(obj)
        })
      }
    })
  })
}

let filename = function(root) {
  return root.replace('__', '')
}

module.exports = function(root, callback) {
  allFiles(root)
    .then(callback)
}
