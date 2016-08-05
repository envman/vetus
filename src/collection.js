var path = require('path')
var Repository = require('./repository')
var fs = require('fs')
var Promise = require('promise')
var mkdirp = require('mkdirp')

var write = Promise.denodeify(fs.writeFile)
var read = Promise.denodeify(fs.readFile)

module.exports = function(options) {
  var root = options.path
  var user = options.user || '_default'
  var branch = options.branch || 'master'

  var bareroot = path.join(root, '_bare')
  var userroot = path.join(root, user)

  var barerepo = new Repository(bareroot)
  var repo = new Repository(userroot)
  var barerepoInit 
  
  var data = {}

  var load = function(callback) {

    createUserDirectory(function() {
      checkUserGit(function() {
        changeBranch(branch, function(branchExists) {
          if (branchExists) {
            repo.pull('origin ' + branch, function() {
              fs.readdir(userroot, function(err, filenames) {
                if (err) {
                  console.log(err)
                  return
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
            })
          } else {
            callback()
          }
        })
      })
    })
  }

  var save = function(message, callback) {
    createDirectory(function() {
      createUserDirectory(function() {
        checkBareGit(function() {
          checkUserGit(function(userExists) {
            var promises = Object.getOwnPropertyNames(data)
              .map(p => write(path.join(userroot, p + '.json'), JSON.stringify(data[p])))

            Promise.all(promises).then(function() {
              if (!barerepoInit) {
                repo.status(function(status) {
                  if (status) {
                    console.log("WARNING: Initial push forced to origin master")
                    addAndCommit(message, function() {
                      repo.push(" origin master", function() {
                        barerepoInit = true
                        callback()
                      })
                    })
                  } else {
                    console.log("WARNING: Empty save - Repo not initialised!")
                    callback()
                  }
                })
              } else {
                //console.log("Saving to branch " + branch)
                changeBranch(branch, function(){
                  addAndCommit(message, function() {
                    repo.push(" origin " + branch, function() {
                      callback()
                    })
                  })
                })
              }
            })
          })
        })
      })
    })
  }

  var merge = function(mergeToBranch, callback) {
    repo.checkout(mergeToBranch, function() {
      repo.merge(branch, callback)
    })
  }

  var changeBranch = function(newbranch, callback) {
    repo.branchExists(newbranch, function(branchExists){
      //console.log("Changing branch to branch " + newbranch)
      if (branchExists) {
        repo.checkout(newbranch, function() {
          callback(branchExists)
        })
      } else {
        repo.branch(newbranch, function() {
          repo.checkout(newbranch, function() {
            callback(branchExists)
          })
        })
      }
    })
  }

  var checkBareGit = function(callback) {
    baregitExists(bareroot, function(bareExists) {
      if (!bareExists) {
        barerepo.initBare(function() {
          callback()
        })
      } else {
        callback()
      }
    })
  }

  var addAndCommit = function(message, callback) {
    repo.status(function(status){
      if (status){
        repo.addAll(function() {
          repo.commit(message, callback)
        })
      }
      else {
        callback()
      }
    })
  }

  var checkUserGit = function(callback) {
    gitExists(userroot, function(userExists) {
      if (!userExists) {
        repo.clone(bareroot ,function() {
          callback(userExists)
        })
      } else {
        callback(userExists)
      }
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

  var baregitExists = function(gitroot, callback) {
    fs.lstat(path.join(gitroot, 'info'), function(lstatErr, stats) {
      if (lstatErr) {
        callback(false)
        return
      }

      callback(stats.isDirectory())
    })
  }

  baregitExists(bareroot, function(result){
    barerepoInit = result
  })

  var createDirectory = function(callback) {
    fs.lstat(bareroot, function(err, stats) {

      if (!stats || !stats.isDirectory()) {
        mkdirp(bareroot, function() {
          callback()
        })
      } else {
        callback()
      }
    })
  }

  var createUserDirectory = function(callback) {
    fs.lstat(userroot, function(err, stats) {

      if (!stats || !stats.isDirectory()) {
        mkdirp(userroot, function() {
          callback()
        })
      } else {
        callback()
      }
    })
  }

  return {
    data: data,
    load: load,
    save: save,
    merge: merge
  }
}
