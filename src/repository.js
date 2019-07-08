const exec = require('child_process').exec
const mkdirp = require('mkdirp')
const Promise = require('promise')
const paths = require('path')
const fs = require('fs')

module.exports = function (path) {
  const execute = function (command) {
    return new Promise((resolve, reject) => {
      gitExecute(command, (result, err) => {
        if (err) {
          return reject(err)
        }

        resolve(result)
      })
    })
  }

  const gitExecute = function (command, callback) {
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

  const config = function (data, callback) {
    gitExecute('config ' + data, callback)
  }

  const commit = function (message, callback) {
    gitExecute(`commit -m "${message}"`, callback)
  }

  const jsonLog = function (logOptions, callback) {
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

  const jsonFormat = function (data, callback) {
    // replace *'s with "'s
    let quoted = data.split('*').join('"')

    // remove trailing ,
    let commaRemoved = quoted.slice(0, -1)

    // add array [ & ]
    let jsonString = '[' + commaRemoved + ']'

    callback(JSON.parse(jsonString))
  }

  const log = function (logOptions, callback) {
    if (typeof logOptions === 'function') {
      callback = logOptions
      logOptions = ''
    }

    gitExecute('log ' + logOptions, callback)
  }

  const isNew = function (callback) {
    exec('git log', {cwd: path}, function (error) {
      if (error && error.toString().indexOf('does not have any commits yet') > -1) {
        callback(true)
      } else {
        callback(false)
      }
    })
  }

  const initBare = function (callback) {
    mkdirp(path, function (err) {
      gitExecute('init --bare', callback)
    })
  }

  const init = function (callback) {
    mkdirp(path, function (err) {
      gitExecute('init', callback)
    })
  }

  // Used -d and not -D as to not force deletion in case remote and local
  // not merged properly. If no problems, should work as expected
  const deleteBranch = function (branch, callback) {
    gitExecute('branch -D ' + branch, function () {
      gitExecute('push origin --delete ' + branch, callback)
    })
  }

  const pull = function (branch, callback) {
    gitExecute(`pull ${branch}`, callback)
  }

  const push = function (options, callback) {
    gitExecute(`push ${options}`, callback)
  }

  const addAll = function (callback) {
    gitExecute('add -A', callback)
  }

  const clone = function (location, callback) {
    mkdirp(path, function (err) {
      if (err) {
        return callback(null, err)
      }

      gitExecute(`clone "${location}" .`, callback)
    })
  }

  const reset = function (type, callback) {
    gitExecute('reset -- ' + type, callback)
  }

  const checkout = function (branch, callback) {
    gitExecute('checkout ' + branch, callback)
  }

  const branch = function (branch, callback) {
    gitExecute('branch ' + branch, callback)
  }

  const clean = function (callback) {
    gitExecute('clean -f', callback)
  }

  const status = function (callback) {
    gitExecute('status', callback)
  }

  const merge = function (branch, callback) {
    gitExecute('merge ' + branch, callback)
  }

  const mergeTheirs = function (branch, callback) {
    gitExecute('merge -X theirs ' + branch, callback)
  }

  const mergeBase = function (branch, mergeToBranch, callback) {
    gitExecute('merge-base ' + branch + ' ' + mergeToBranch, callback)
  }

  const branchExists = function (branch, callback) {
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

  const branchList = function (callback) {
    gitExecute('branch --all', callback)
  }

  const fetch = function (callback) {
    gitExecute('fetch', callback)
  }

  const currentCommit = (callback) => {
    gitExecute('rev-parse HEAD', callback)
  }

  const tag = (tagName, callback) => {
    gitExecute(`commit --allow-empty -m "Commit for tag ${tagName}"`, () => {
      gitExecute(`tag ${tagName}`, (_, err) => {
        if (err) return callback(false)

        return callback(true)
      })
    })
  }

  const getLatestTag = callback => {
    gitExecute('describe --tags --abbrev=0', (result, err) => {
      if (err) return callback(undefined)

      return callback((result || '').trim() || undefined)
    })
  }

  return {
    commit,
    jsonLog,
    log,
    init,
    pull,
    push,
    addAll,
    clone,
    initBare,
    config,
    reset,
    checkout,
    branch,
    clean,
    status,
    branchExists,
    merge,
    mergeTheirs,
    mergeBase,
    branchList,
    fetch,
    deleteBranch,
    execute,
    isNew,
    currentCommit,
    tag,
    getLatestTag
  }
}
