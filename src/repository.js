let exec = require('child_process').exec
let mkdirp = require('mkdirp')
let Promise = require('promise')
let paths = require('path')
let fs = require('fs')

module.exports = function (path) {
  let execute = function (command) {
    return new Promise((resolve, reject) => {
      gitExecute(command, (result, err) => {
        if (err) {
          return reject(err)
        }

        resolve(result)
      })
    })
  }

  let gitExecute = function (command, callback) {
    command = 'git ' + command

    exec(command, {cwd: path}, function (error, result) {
      if (error && !error.toString().includes(`Couldn't find remote ref master`)) {
        console.log('Error with command -', command)
        console.log('In Path', path)
        console.log(error)

        callback(null, error)
      }
      else {
        callback(result)
      }
    })
  }

  let config = function (data, callback) {
    gitExecute('config ' + data, callback)
  }

  let commit = function (message, callback) {
    gitExecute(`commit -m "${message}"`, callback)
  }

  let jsonLog = function (logOptions, callback) {
    if (typeof logOptions === 'function') {
      callback = logOptions
      logOptions = {}
    }

    let gitCall = `--pretty=format:"{ *commit*: *%H*, *author*: *%an <%ae>*, *date*: *%ad*, *message*: *%s*},"`

    if (logOptions.branch) {
      gitCall += ` ${logOptions.branch}`
    }

    if (logOptions.file) {
      logOptions.file = `${logOptions.file}.json`
      gitCall += ` ${logOptions.file}`
    }

    if (logOptions.file) {
      fs.stat(paths.join(path, logOptions.file), function (err, data) {
        if (logOptions.file && err) {
          return callback([])
        }

        log(gitCall, function (data, error) {
          if (error || !data) {
            return callback(null, error || 'No Log')
          }

          jsonFormat(data, callback)
        })
      })
    } else {
      log(gitCall, function (data, error) {
        if (error) {
          return callback(null, error)
        }

        jsonFormat(data, callback)
      })
    }
  }

  let jsonFormat = function (data, callback) {
    // replace *'s with "'s
    let quoted = data.split('*').join('"')

    // remove trailing ,
    let commaRemoved = quoted.slice(0, -1)

    // add array [ & ]
    let jsonString = '[' + commaRemoved + ']'

    callback(JSON.parse(jsonString))
  }

  let log = function (logOptions, callback) {
    if (typeof logOptions === 'function') {
      callback = logOptions
      logOptions = ''
    }

    gitExecute('log ' + logOptions, callback)
  }

  let isNew = function (callback) {
    exec('git log', {cwd: path}, function (error) {
      if (error && error.toString().indexOf('does not have any commits yet') > -1) {
        callback(true)
      } else {
        callback(false)
      }
    })
  }

  let initBare = function (callback) {
    mkdirp(path, function (err) {
      gitExecute('init --bare', callback)
    })
  }

  let init = function (callback) {
    mkdirp(path, function (err) {
      gitExecute('init', callback)
    })
  }

  // Used -d and not -D as to not force deletion in case remote and local
  // not merged properly. If no problems, should work as expected
  let deleteBranch = function (branch, callback) {
    gitExecute('branch -D ' + branch, function () {
      gitExecute('push origin --delete ' + branch, callback)
    })
  }

  let pull = function (branch, callback) {
    gitExecute(`pull ${branch}`, callback)
  }

  let push = function (options, callback) {
    gitExecute(`push ${options}`, callback)
  }

  let addAll = function (callback) {
    gitExecute('add -A', callback)
  }

  let clone = function (location, callback) {
    mkdirp(path, function (err) {
      if (err) {
        return callback(null, err)
      }

      gitExecute(`clone "${location}" .`, callback)
    })
  }

  let reset = function (type, callback) {
    gitExecute('reset -- ' + type, callback)
  }

  let checkout = function (branch, callback) {
    gitExecute('checkout ' + branch, callback)
  }

  let branch = function (branch, callback) {
    gitExecute('branch ' + branch, callback)
  }

  let clean = function (callback) {
    gitExecute('clean -f', callback)
  }

  let status = function (callback) {
    gitExecute('status', callback)
  }

  let merge = function (branch, callback) {
    gitExecute('merge ' + branch, callback)
  }

  let mergeTheirs = function (branch, callback) {
    gitExecute('merge -X theirs ' + branch, callback)
  }

  let mergeBase = function (branch, mergeToBranch, callback) {
    gitExecute('merge-base ' + branch + ' ' + mergeToBranch, callback)
  }

  let branchExists = function (branch, callback) {
    gitExecute('fetch --all', function () {
      gitExecute('branch --list ' + branch, function (result) {
        if (!result) {
          gitExecute('branch --remote', function (remoteResult) {
            if (remoteResult.indexOf(branch) > -1) {
              callback(branch)
            } else {
              callback(null)
            }
          })
        } else {
          callback(result)
        }
      })
    })
  }

  let branchList = function (callback) {
    gitExecute('branch --all', callback)
  }

  let fetch = function (callback) {
    gitExecute('fetch', callback)
  }

  return {
    commit: commit,
    jsonLog: jsonLog,
    log: log,
    init: init,
    pull: pull,
    push: push,
    addAll: addAll,
    clone: clone,
    initBare: initBare,
    config: config,
    reset: reset,
    checkout: checkout,
    branch: branch,
    clean: clean,
    status: status,
    branchExists: branchExists,
    merge: merge,
    mergeTheirs: mergeTheirs,
    mergeBase: mergeBase,
    branchList: branchList,
    fetch: fetch,
    deleteBranch: deleteBranch,
    execute: execute,
    isNew: isNew
  }
}
