const path = require('path')
const Repository = require('./repository')
const fs = require('fs')
const util = require('util')
const Promise = require('promise')
const mkdirp = require('mkdirp')

const access = util.promisify(fs.access)

module.exports = function(options) {
  let root = options.path
  let user = options.user || '_default'
  let email = options.email || user + '@vetus'
  let branch = options.branch || 'master'

  let bareroot = path.join(root, '_bare')
  let userroot = path.join(root, user)

  let barerepo = new Repository(bareroot)
  let repo = new Repository(userroot)

  let data = {}

  let load = function (callback) {
    barerepo.lstree(branch)
      .then(files => files.map(f => barerepo.show(branch, f).then(data => ({ name: f.replace('.json', ''), object: JSON.parse(data) }))))
      .then(promises => Promise.all(promises))
      .then(files => {
          let data = {}
          files.map(f => {
            data[f.name] = f.object
          })

          collection.data = data

          return barerepo.lastestCommit(branch)
            .then(commit => {
                collection.commit = commit
                callback()
            })
      })
      .catch(err => {
        console.error(err)
        callback(undefined, err)
      })
  }

  let save = function (message, callback) {
    let promise = []
    fs.readdir(userroot, (err, files) => {
      if (files) {
        promise = files.filter(file => file.endsWith('.json')).map(f => new Promise((done, fail) => {
          fs.unlink(path.join(userroot, f), () => {
            done()
          })
        }))
      }

      Promise.all(promise).then(() => {
        preCommandAlt(function() {
          let proms = Object.getOwnPropertyNames(collection.data).map(f => new Promise((done, fail) => {
            fs.writeFile(path.join(userroot, `${f}.json`), JSON.stringify(collection.data[f], null, 2), () => {
              done()
            })
          }))

          Promise.all(proms).then(() => {
            addAndCommit(message, function (committed) {
              if (committed) {
                pull(function(result, error) {
                  if (!error) {
                    repo.push(`origin ${branch}`, callback)
                  } else {
                    callback()
                  }
                })
              } else {
                callback()
              }
            })
          })
        })
      })
    })
  }

  let merge = function(fromBranch, callback) {
    preCommand(function() {
      repo.merge(fromBranch, function(output, err) {
        if (err) {
          repo.merge("--abort", function() {
            console.log("Merge conflict : ", err)
            return callback(null, err)
          })
        } else {
          repo.push('', () => {
            callback()
          })
        }
      })
    })
  }

  let mergeTheirs = function(fromBranch, callback) {
    preCommand(function() {
      repo.mergeTheirs(fromBranch, function(output, err) {
        if (err) {
          repo.mergeTheirs(" --abort", function() {
            console.log("Merge conflict : ", output)
            return callback(err)
          })
        } else {
          repo.push('', () => {
            callback()
          })
        }
      })
    })
  }

  let deleteBranch = function(branchToDelete, callback) {
    repo.fetch(function() {
      repo.branchExists(branchToDelete, function(branchExists) {
        if (!branchExists) {
          return callback()
        }

        repo.deleteBranch(branchToDelete, callback)
      })
    })
  }

  let createBranch = function(newbranch, callback) {
    preCommand(function() {
      repo.branchExists(newbranch, function(branchExists){
        if (!branchExists) {
          repo.execute("checkout " + branch)
            .then(() => repo.execute("checkout -b " + newbranch))
            .then(() => branch = newbranch)
            .then(() => repo.execute("push -u origin " + newbranch))
            .nodeify(callback)

        } else {
          callback()
        }
      })
    })
  }

  let changeBranch = function(newbranch, callback) {
    repo.branchExists(newbranch, function(branchExists){
      if (branchExists) {
        repo.checkout(newbranch, function() {
          branch = newbranch

          callback(branchExists)
        })
      } else {
        callback(branchExists)
      }
    })
  }

  const loadVersion = (ref, callback) => {
    repo.tagExists(ref, exists => {
      if (exists) {
        repo.checkout(ref, () => {
          callback(true)
        })
      } else {
        callback(false)
      }
    })
  }

  let checkBareGit = function(callback) {
    baregitExists(bareroot, function(bareExists) {
      if (!bareExists) {
        barerepo.initBare(callback)
      } else {
        callback()
      }
    })
  }

  let addAndCommit = function(message, callback) {
    repo.addAll(function() {
      repo.status(function(status) {
        if (status.indexOf('nothing to commit') < 0) {
          repo.commit(message, function() {
            callback(true)
          })
        } else {
          callback(false)
        }
      })
    })
  }

  let checkUserGit = function(callback) {
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

  let gitExists = function(gitroot, callback) {
    fs.lstat(path.join(gitroot, '.git'), function(lstatErr, stats) {
      if (lstatErr) {
        return callback(false)
      }

      callback(stats.isDirectory())
    })
  }

  let baregitExists = function(gitroot, callback) {
    fs.lstat(path.join(gitroot, 'info'), function(lstatErr, stats) {
      if (lstatErr) {
        return callback(false)
      }

      callback(stats.isDirectory())
    })
  }

  baregitExists(bareroot, function(result){
    barerepoInit = result
  })

  let checkPaths = function(paths) {
    let proms = paths.map(p => new Promise(function(resolve, reject) {
      fs.lstat(p, function(err, stats) {
        if (!stats || !stats.isDirectory()) {
          mkdirp(p, resolve)
        } else {
          resolve()
        }
      })
    }))

    return Promise.all(proms)
  }

  let branchList = function(callback) {
    preCommand(function() {
      repo.fetch(function() {
        repo.branchList(function(list) {
          let items = list.split('\n')

          items = items
            .filter(b => b !== '')
            .map(b => b.replace('* ', '').replace('  ', '').replace('remotes/origin/', ''))
            .filter(b => !b.startsWith('HEAD'))

          callback(arrayUnique(items))
        })
      })
    })
  }

  let pull = function(callback) {
    repo.pull(`origin ${branch}`, callback)
  }

  let branchLog = function(opts, callback) {
    preCommand(function() {
      repo.jsonLog(opts, callback)
    })
  }

  let preCommand = function(callback) {
    checkPaths([bareroot, userroot])
      .then(() => {
        checkBareGit(function() {
          checkUserGit(function() {
            repo.isNew(function(isNew) {
              if (isNew) {
                callback(true)
              } else {
                changeBranch(branch ,function(exists) {
                  if (exists) {
                    repo.execute('fetch --prune')
                      .then(() => {
                          pull(callback)
                      })
                  } else {
                    loadVersion(branch, e => callback(e))
                  }
                })
              }
            })

          })
        })
      })
  }

  let preCommandAlt = function(callback) {
    checkPaths([bareroot, userroot])
      .then(() => {
        checkBareGit(function() {
          checkUserGit(function() {
            repo.isNew(function(isNew) {
              if (isNew) {
                callback(true)
              } else {
                changeBranch(branch ,function(exists) {
                  if (exists) {
                    repo.execute('fetch --prune')
                      .then(() => callback())
                  } else {
                      return callback(exists)
                  }
                })
              }
            })

          })
        })
      })
  }

  let arrayUnique = function(a) {
      return a.reduce(function(p, c) {
          if (p.indexOf(c) < 0) p.push(c)
          return p
      }, [])
  }

  const getVersion = callback => {
    barerepo.getLatestTag(branch, tag => {
      if (!tag) return callback(undefined)

      const v = tag.match(/v_(.*)_/)
      if (!v || !v.length) return callback(undefined)

      const [major, minor] = v[1].split(/\./).map(Number)
      callback({ major, minor })
    })
  }

  const allVersions = callback => {
    barerepo.getTags('v_*_', tags => {
      if (!tags) return callback(undefined)

      const versions = tags
        .map(t => t.match(/v_(.*)_/))
        .filter(t => t)
        .map(t => t[1].split(/\./).map(Number))
        .map(([major, minor]) => ({major, minor}))

      return callback(versions)
    })
  }

  const newVersion = (version, callback) => {
    const { major, minor } = version
    if ([major, minor].some(v => isNaN(Number(v)))) {
      return callback(false)
    }

    const newTag = `v_${major}.${minor}_`
    preCommand(() => {
      repo.preTagCommit(branch, newTag, (targetCommit, err) => {
        if (err) {
          return callback(undefined, err)
        }

        barerepo.tag(newTag, targetCommit, ok => {
          return callback(ok && version)
        })
      })
    })
  }

  const versionBump = (type, callback) => {
    if (!['major', 'minor'].includes(type)) {
      return callback(false)
    }

    getVersion(version => {
      if (!version) {
        version = { major: 1, minor: 0 }
      } else {
        if (type === 'major') {
          version.major += 1
          version.minor = 0
        } else if (type === 'minor') {
          version.minor += 1
        }
      }

      newVersion(version, callback)
    })
  }

  const collection = {
    data,
    load,
    save,
    createBranch,
    changeBranch,
    loadVersion,
    merge,
    mergeTheirs,
    branchList,
    deleteBranch,
    log: branchLog,
    versionBump,
    getVersion,
    allVersions
  }

  return collection
}
