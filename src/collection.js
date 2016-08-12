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
  var email = options.email || user + '@vetus'
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
            console.log("ERROR: Branch does not exist - use createBranch")
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
            var promises = Object.getOwnPropertyNames(collection.data)
              .map(p => write(path.join(userroot, p + '.json'), JSON.stringify(collection.data[p], null, 2)))

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

  var merge = function(fromBranch, callback) {
    repo.checkout(branch, function() {
      repo.merge(fromBranch, function(output, err) {
        if (err) {
          repo.merge(" --abort", function() {
            console.log("Merge conflict : ")
            console.log(output)
            resolveConflict(fromBranch,callback)
          })
        } else {
          callback()
        }
      })
    })
  }

  var createBranch = function(newbranch, callback) {
    repo.branchExists(newbranch, function(branchExists){
      if (!branchExists) {
        repo.checkout(branch, function() {
          repo.branch(newbranch, function() {
            repo.checkout(newbranch, function() {
              repo.push(" origin " + newbranch, function() {
                console.log("Branch created & pushed to origin")
                callback()
              })
            })
          })
        })
      } else {
        console.log("ERROR: Branch already exists")
        callback()
      }
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
            // diff(baseObj, leftObj, rightObj, function() {
            //   callback()
            // })
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

  var objToBranch = function (obj, branchToSave, callback) {
    var promises = Object.getOwnPropertyNames(obj)
      .map(p => write(path.join(userroot, p + '.json'), JSON.stringify(obj[p], null, 2)))

    Promise.all(promises).then(function() {
      addAndCommit(branchToSave, function() {
        repo.push(" origin " + branchToSave, function() {
          callback()
        })
      })
    })
  }

  var getSmallestCommitPath = function(index, commitPath, callback) {
    repo.branchExists("hist_" + commitPath[index].commit, function(result) {
      if (result) {
        // TO ADD: A CHECK HERE IF THE HISTORY BRANCH IS VALID ON THIS COMMITPATH
        var slicedPath = commitPath.slice(0,index+1)
        console.log(slicedPath)
        callback(slicedPath)
      } else if (index+1 == commitPath.length) {
        callback(commitPath)
      }
      else {
        getSmallestCommitPath(index+1, commitPath, callback)
      }
    })
  }

  var updateHistory = function(callback) {
    console.log("UPDATE HISTORY CALLED ON BRANCH " + branch)
    // get the commit path for this branch
    repo.checkout(branch, function() {
      repo.jsonLog(branch + ' -s ', function(commitPath) {
        // slice the path if there already exists a history branch
        getSmallestCommitPath(0, commitPath, function(slicedPath) {
          if (commitPath != slicedPath) {
            // We found a history branch! Let's use this & previous commit
            console.log("History found in commit path")
            orderedCommits = slicedPath.reverse()
            branchToObj("hist_" + orderedCommits[0].commit, function(historyJson) {
              getSharedCommits(branch, function(sharedCommits) {
                currentCommit = orderedCommits[0]
                orderedCommits.shift()
                createHistory(currentCommit, orderedCommits, sharedCommits, historyJson, function(result) { 
                  callback(result)
                })
              })
            })
          } else {
            // We must create the history from scratch!
            console.log("Making history from scratch")
            slicedPath.push({})
            orderedCommits = slicedPath.reverse()
            getSharedCommits(branch, function(sharedCommits) {
              currentCommit = orderedCommits[0]
              orderedCommits.shift()
              createHistory(currentCommit, orderedCommits, sharedCommits, {}, function(result) { 
                callback(result)
              })
            })
          }
        })
      })
    })
  }

  var getSharedCommits = function(branch, callback) {
    repo.checkout(branch, function() {
      repo.branchList(function(branches) {
        var mergeBases = []
        branches = (branches.split('\n')).slice(0,-1)
        console.log(branches)
        var promises = branches
          .map(f => new Promise(function(done) {
            repo.mergeBase(branch, f.substring(1), function(result) {
              mergeBases.push(result.trim())
              done()
            })
          }))

        Promise.all(promises).then(function() {
          callback(mergeBases)
        })
      })
    })
  }

  var createHistory = function(previousCommit, commitPath, sharedCommits, json, callback) {
    
    console.log("Create History called!")
    console.log("Previous Commit = " + previousCommit.commit)
    console.log("CommitPath length = " + commitPath.length)

    if (commitPath.length > 0) {
      currentCommit = commitPath[0]
      console.log("Updating commit " + previousCommit.commit)
      console.log("   using commit " + currentCommit.commit)

      updateJson(previousCommit, currentCommit, json, function(result) {
        // create branch and commit this new json bruh
        console.log("Recursive call to create history")
        createHistory(currentCommit, commitPath.slice(1), sharedCommits, result, callback)
      })
    } else {
      // Create a history branch @ previous commit
      var historybranch = "hist_" + previousCommit.commit
      repo.branchExists(historybranch, function(result) {
        // The history branch exists
        if(result) {
          console.log("History exists, returning")
          repo.checkout(branch, function() {
            callback(json)
          })
        } else {
          console.log("Created history branch @ " + historybranch)
          repo.checkout(previousCommit.commit, function() {
            repo.branch(historybranch, function() {
              repo.checkout(historybranch, function() {
                objToBranch(json, historybranch, function() {
                  console.log("Saved the history")
                  repo.checkout(branch, function() {
                    callback(json)
                  })
                })
              })
            })
          })
        }
      })
    }
  }

  var updateJson = function(oldCommitInfo, newCommitInfo, historyJson, callback) {
    // convert this commit to an obj
    branchToObj(newCommitInfo.commit, function(newCommitJson) {
      // compare the jsons, returns new updated json
      if (!oldCommitInfo.commit) {
        //console.log("INITIAL COMMIT")
        compareJson({}, newCommitJson, historyJson, newCommitInfo, function(modified, resultJson) {
          callback(resultJson)
        })
      } else {
        //console.log("UPDATING COMMIT")
        branchToObj(oldCommitInfo.commit, function(oldCommitJson) {
          compareJson(oldCommitJson, newCommitJson, historyJson, newCommitInfo, function(modified, resultJson) {
            callback(resultJson)
          })
        })
      }
    })
  }

  // Compares two json files with optional historyjson, returning the difference as a history JSON w/ commit info
  var compareJson = function(oldCommitJson, newCommitJson, historyJson, newCommitInfo, callback) {

    var modified = false

    // debug info (believe me its damn useful LOL)
    // console.log("Comparing jsons")
    // console.log("New: " + (typeof newCommitJson) + JSON.stringify(newCommitJson))
    // console.log("Old: " + (typeof oldCommitJson) + JSON.stringify(oldCommitJson))
    // console.log("Hist: " + (typeof historyJson) + JSON.stringify(historyJson))

    // Iterate through all the keys in newCommitJson, looking for new attributes 
    for (var i in newCommitJson) {

      // If the attribute doesnt exist in the old Json OR the old json isnt an object..
      if (!(typeof oldCommitJson == 'object') || !(i in oldCommitJson)) {
        newVersion = newCommitJson[i]
        console.log("New attribute " + i  + " - " + newCommitInfo.author + " at " + newCommitInfo.date)
        if (newVersion instanceof Array) {
            // The newversion is an array

            // TO DO ?!?! -  for loop of recursive calls w/ empty oldcommit

        } else if (typeof newVersion == 'object') {
          //The newversion is an object

          //Compare the children json with empty json - makes all children new basically
          compareJson({}, newVersion, {}, newCommitInfo, function(extractModified, jsonExtract) { 
            // Add parent history
            historyJson[i] = jsonExtract
            historyJson["$hist_" + i] = "Created by " + newCommitInfo.author + " at " + newCommitInfo.date
            modified = true
          })
        } else {
          // The newversion is a variable

          // Add it to the json and history 
          historyJson[i] = newVersion
          historyJson["$hist_" + i] = "Created with value '" + newVersion + "' by " + newCommitInfo.author + " at " + newCommitInfo.date
          modified = true
        }
      }
    }

    // Iterate through all the keys in oldCommitJson, looking for updates and deletions
    for (var i in oldCommitJson) {

      // The key exists in both the old and new object
      if (i in newCommitJson && (typeof newCommitJson == 'object')) {
        oldVersion = oldCommitJson[i]
        newVersion = newCommitJson[i]

        // The old ver is not equal to the new ver
        // Note - object comparison always returns false -> we need a 'modified' parameter in this circumstance 
        if (oldVersion !== newVersion) {
          // should be an index in history.json unless something is broken..
          console.log("Updated attribute " + i + " - " + newCommitInfo.author + " at " + newCommitInfo.date)
          
          // Additional information for any type conversion that occurs from old -> new
          typeConversion = ""
          if (typeof newVersion !== typeof oldVersion) {
            typeConversion = " - Changed type from " + (typeof oldVersion) + " to " + (typeof newVersion)
          } 

          if (newVersion instanceof Array) {
            // The newversion is an array

            // TO DO ?!?! -  for loop of recursive calls w/ empty oldcommit

            modified = true
          } else if (typeof newVersion == 'object') {
            // The newversion is an object

            // If the old version is not an object, its gotta be removed
            if (typeof oldVersion !== 'object') {
              oldVersion = {}
              historyJson[i] = {} 
            }

            // Compare the children json files, using the history for updates
            compareJson(oldVersion, newVersion, historyJson[i], newCommitInfo, function(extractModified, jsonExtract) {
              if (extractModified) {
                // The extract was modified from old -> new
                // Update parent history
                historyJson[i] = jsonExtract
                historyJson["$hist_" + i] = "Modified by " + newCommitInfo.author + " at " + newCommitInfo.date + typeConversion
                modified = true
              }
            })
          } else {
            // The newversion is a variable
            // Update variable & history
            historyJson[i] = newVersion
            historyJson["$hist_" + i] += "\nUpdated with value '" + newVersion + " by " + newCommitInfo.author + " at " + newCommitInfo.date + typeConversion
            modified = true
          }
        }
      } else {
        // The attribute was deleted
        if(historyJson[i]) {
          delete historyJson[i]
          modified = true
        }

        if (historyJson["$hist_" + i]) {
          delete historyJson["$hist_" + i]
          modified = true
        }
      }
    }

    // Return whether the json was modified + changed file
    callback(modified, historyJson)
  }

  var getHistory = function(logOptions, callback) {
    repo.jsonLog(logOptions + ' ' + branch, function(result) {
      callback(result)
    })
  }

  var changeBranch = function(newbranch, callback) {
    repo.branchExists(newbranch, function(branchExists){
      if (branchExists) {
        repo.checkout(newbranch, function() {
          callback(branchExists)
        })
      } else {
        console.log("ERROR: Branch does not exist - use createBranch")
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
    repo.fetch(function() {
      repo.branchList(function(list) {
        var items = list.split('\n')

        var items = items
          .filter(b => b !== '')
          .map(b => {
          if (b.startsWith('* ')) {
            b = b.replace('* ', '')
          }

          if (b.startsWith('  ')) {
            b = b.substring(2)
          }

          if (b.startsWith('remotes/origin/')) {
            b = b.replace('remotes/origin/', '')
          }

          return b
        })
        .filter(b => !b.startsWith('HEAD'))

        callback(arrayUnique(items))
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
    updateHistory: updateHistory,
    merge: merge,
    getHistory: getHistory,
    branchList: branchList
  }

  return collection
}
