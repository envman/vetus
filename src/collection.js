var path = require('path')
var Repository = require('./repository')
var fs = require('fs')
var Promise = require('promise')
// var settings = require('./settings')

var write = Promise.denodeify(fs.writeFile)
var read = Promise.denodeify(fs.readFile)

module.exports = function(options) {
  var root = options.path
  var data = {}
  var repo = new Repository(root)

  var load = function(callback) {

    fs.readdir(root, function(err, filenames) {

      if (err) {
        console.log(err)
        return;
      }

      var promises = filenames
        .filter(f => f.endsWith('.json'))
        .map(f => new Promise(function(done, error) {

          fs.readFile(path.join(root, f), 'utf-8', function(err, file) {

            if (err) {
              error(err)
            } else {
              var obj = JSON.parse(file)
              data[f.replace('.json', '')] = obj
              done()
            }
          })
        }))

      Promise.all(promises).then(function() {
        callback()
      })
    })
  }

  var save = function(message, callback) {

    createDirectory(function() {
      var promises = Object.getOwnPropertyNames(data)
        .map(p => write(path.join(root, p + '.json'), JSON.stringify(data[p])))

      Promise.all(promises).then(function() {

        gitExists(function(exists) {
          if (!exists) {
            repo.init(function() {
              repo.addAll(function() {
                repo.commit(message, callback)
              })
            })
          } else {
            repo.addAll(function() {
              repo.commit(message, callback)
            })
          }
        })
      })
    })
  }

  var gitExists = function(callback) {
    fs.lstat(path.join(root, '.git'), function(lstatErr, stats) {
      if (lstatErr) {
        callback(false)
        return
      }

      callback(stats.isDirectory())
    })
  }

  var createDirectory = function(callback) {
    fs.lstat(root, function(err, stats) {

      if (!stats || !stats.isDirectory()) {
        fs.mkdir(root, function() {
          callback()
        })

        return
      }

      callback()
    })
  }

  return {
    data: data,
    load: load,
    save: save
  }
}
