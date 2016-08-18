var path = require('path')
var Repository = require('./repository')
var fs = require('fs')
var Promise = require('promise')
var mkdirp = require('mkdirp')
var historyGenerator = require('./history-generator')

var write = Promise.denodeify(fs.writeFile)
var read = Promise.denodeify(fs.readFile)

module.exports = function(options) {
  var root = options.path
  var user = options.user || '_default'
  var email = options.email || user + '@vetus'
  var branch = options.branch || 'master'

  var bareroot = path.join(root, '_bare')
  var userroot = path.join(root, user)

  var barerepo = new Repository(bareroot)
  var repo = new Repository(userroot)

  var data = {}

  var load = function(callback) {
    preCommand(function(branchExists) {
      fs.readdir(userroot, function(err, filenames) {
        if (err) {
          return console.log(err)
        }

        var promises = filenames
          .filter(f => f.endsWith('.json'))
          .map(f => new Promise(function(done, error) {

            fs.readFile(path.join(userroot, f), 'utf-8', function(err, file) {
              if (err) return error(err)

              data[f.replace('.json', '')] = JSON.parse(file)
              return done()
            })
          }))

        Promise.all(promises).then(function() {
          callback()
        })
      })
    })
  }

  var save = function(message, callback) {
    preCommand(function() {
      var promises = Object.getOwnPropertyNames(collection.data)
        .map(p => write(path.join(userroot, p + '.json'), JSON.stringify(collection.data[p], null, 2)))

      Promise.all(promises).then(function() {
        addAndCommit(message, function() {
          repo.push(" origin " + branch, function() {
            callback()
          })
        })
      })
    })
  }

  var merge = function(fromBranch, callback) {
    preCommand(function(exists) {
      repo.merge(fromBranch, function(output, err) {
        if (err) {
          repo.merge(" --abort", function() {
            console.log("Merge conflict : ", output)
            resolveConflict(fromBranch, callback)
          })
        } else {
          callback()
        }
      })
    })
  }

  var createBranch = function(newbranch, callback) {
    preCommand(function(oldBranchExists) {
      repo.branchExists(newbranch, function(branchExists){
        if (!branchExists) {
          repo.checkout(branch, function() {
            repo.branch(newbranch, function() {
              repo.checkout(newbranch, function() {
                repo.push(" origin " + newbranch, function() {
                  console.log("Branch created & pushed to origin")
                  branch = newbranch
                  callback()
                })
              })
            })
          })
        } else {
          callback()
        }
      })
    })
  }

  var resolveConflict = function(mergeToBranch, callback) {
    repo.mergeBase(branch, mergeToBranch, function(base) {
      var baseObj, leftObj, rightObj
      branchToObj(base, function(baseObj) {
        baseObj = baseObj
        branchToObj(branch, function(leftObj) {
          leftObj = leftObj
          branchToObj(mergeToBranch, function(rightObj) {
            rightObj = rightObj
            callback()
          })
        })
      })
    })
  }

  var branchToObj = function(currentbranch, callback) {
    repo.checkout(currentbranch, function() {
      var localdata = {}
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
                localdata[f.replace('.json', '')] = obj
                done()
              }
            })
          }))

        Promise.all(promises).then(function() {
          callback(localdata)
        })
      })
    })
  }

  var history = function(callback) {
    repo.jsonLog(branch + ' -s ', function(commits) {

      loadCommits(commits.reverse(), [], function(commitDatas) {
        var history = historyGenerator(commitDatas)
        callback(history)
      })
    })
  }

  var loadCommits = function(commits, commitDatas, callback) {
    if (commits.length > 0) {
      var commit = commits.shift()

      branchToObj(commit.commit, function(obj) {
        obj.$commit = commit
        commitDatas.push(obj)
        loadCommits(commits, commitDatas, callback)
      })
    } else {
      callback(commitDatas)
    }
  }

  var changeBranch = function(newbranch, callback) {
    repo.branchExists(newbranch, function(branchExists){
      if (branchExists) {
        repo.checkout(newbranch, function() {
          callback(branchExists)
        })
      } else {
        callback(branchExists)
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
        repo.clone(bareroot, function() {
          repo.config('user.name "' + user + '"', function() {
            repo.config('user.email ' + email, function() {
              callback(userExists)
            })
          })
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

  var branchList = function(callback) {
    preCommand(function() {
      repo.fetch(function() {
        repo.branchList(function(list) {
          var items = list.split('\n')

          var items = items
            .filter(b => b !== '')
            .map(b => b.replace('* ', '').replace('  ', '').replace('remotes/origin/', ''))
            .filter(b => !b.startsWith('HEAD'))

          callback(arrayUnique(items))
        })
      })
    })
  }

  var pull = function(callback) {
    repo.pull('origin ' + branch, function() {
      callback()
    })
  }

  var preCommand = function(callback) {
    createDirectory(function() {
      createUserDirectory(function() {
        checkBareGit(function() {
          checkUserGit(function() {
            changeBranch(branch ,function(exists) {
              if (exists) {
                return pull(callback)
              }

              return callback(exists)
            })
          })
        })
      })
    })
  }

  var arrayUnique = function(a) {
      return a.reduce(function(p, c) {
          if (p.indexOf(c) < 0) p.push(c)
          return p
      }, [])
  }

  var collection = {
    data: data,
    load: load,
    save: save,
    createBranch: createBranch,
    history: history,
    merge: merge,
    branchList: branchList
  }

  return collection
}
