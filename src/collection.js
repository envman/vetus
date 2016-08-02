var path = require('path')
var Repository = require('./repository')
var fs = require('fs')
var Promise = require('promise')
// var settings = require('./settings')

var write = Promise.denodeify(fs.writeFile)
var read = Promise.denodeify(fs.readFile)

module.exports = function(options) {
  var root = options.path
  var user = options.user || '_default'
  var bareroot = path.join(root,'_bare')
  var data = {}
  var barerepo = new Repository(bareroot)
  var userroot = path.join(root, user)

  var repo = new Repository(userroot)

  // Directory setup for empty repository
  fs.lstat(bareroot, function(lstatErr, stats) {
    if (!stats){
      fs.mkdirSync(root)
      fs.mkdirSync(bareroot)
      fs.mkdirSync(userroot)
    } else {
      // Directory setup for new user / default
      fs.lstat(userroot, function(lstatErr, stats) {
        if (!stats){
          fs.mkdirSync(userroot)
        }
      })
    }
  })

  var load = function(callback) {

    fs.readdir(userroot, function(err, filenames) {

      if (err) {
        console.log(err)
        return;
      }

      var promises = filenames
        .filter(f => f.endsWith('.json'))
        .map(f => new Promise(function(done, error) {

          fs.readFile(path.join(userroot, f), 'utf-8', function(err, file) {

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
        .map(p => write(path.join(userroot, p + '.json'), JSON.stringify(data[p])))
      Promise.all(promises).then(function() {
        gitExists(userroot, function(exists) {
          if (!exists) {
            repo.init(function() {
              repo.addAll(function() {
                repo.commit(message, callback)
              })
            })
          } else {
            // Code needed here to verify if there are changes to commit
            repo.addAll(function() {
              repo.commit(message, callback)
            })
          }
        })
      })
    })
  }

  var gitExists = function(gitroot, callback) {
    fs.lstat(path.join(gitroot, '.git'), function(lstatErr, stats) {
      if (lstatErr) {
        callback(false)
        return
      }

      callback(stats.isDirectory())
    })
  }

  var createDirectory = function(callback) {
    fs.lstat(bareroot, function(err, stats) {

      if (!stats || !stats.isDirectory()) {
        fs.mkdir(bareroot, function() {
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
