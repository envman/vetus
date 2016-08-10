var exec = require('child_process').exec
var mkdirp = require('mkdirp')

module.exports = function(path) {
  var path = path

  var gitExecute = function(command, callback) {
    var command = 'git ' + command

   // console.log(command, path)

    exec(command, {cwd: path}, function(error, result) {
      if (error != null) {
        console.log("Error with command - " + command)
        console.log(error)
        callback(result, error)
      }
      else {
        callback(result)
      }
    })
  }

  var config = function(data, callback) {
    gitExecute('config ' + data, callback)
  }

  var commit = function(message, callback) {
    gitExecute('commit -m "' + message + '"', callback)
  }

  var jsonLog = function(logOptions, callback) {
    if (typeof logOptions === 'function') {
      callback = logOptions
      logOptions = ''
    }

    gitExecute('log ' + logOptions + ' --pretty=format:"{ *commit*: *%H*, *author*: *%an <%ae>*, *date*: *%ad*, *message*: *%f*},"', function(data) {

      // replace *'s with "'s
      var quoted = data.split('*').join('"')

      // remove trailing ,
      var commaRemoved = quoted.slice(0, -1)

      // add array [ & ]
      var jsonString = '[' + commaRemoved + ']'

      callback(JSON.parse(jsonString))
    })
  }

  var log = function(logOptions, callback) {
    if (typeof logOptions === 'function') {
      callback = logOptions
      logOptions = ''
    }
    gitExecute('log ' + logOptions, function(result) {
      callback(result)
    })
  }

  var initBare = function(callback) {
    mkdirp(path, function(err) {
      gitExecute('init --bare', callback)
    })
  }

  var init = function(callback) {
    mkdirp(path, function(err) {
      gitExecute('init', callback)
    })
  }

  var pull = function(branch, callback) {
    gitExecute('pull ' + branch, callback)
  }

  var push = function(options, callback) {
    gitExecute('push' + options, callback)
  }

  var addAll = function(callback) {
    gitExecute('add -A', callback)
  }

  var clone = function(location, callback) {
    mkdirp(path, function(err) {
        gitExecute('clone "' + location + '" . ', callback)
    })
  }

  var reset = function(type, callback) {
    gitExecute('reset --' + type, callback)
  }

  var checkout = function(branch, callback) {
    gitExecute('checkout ' + branch, callback)
  }

  var branch = function(branch, callback) {
    gitExecute('branch ' + branch, callback)
  }

  var clean = function(callback) {
    gitExecute('clean -f', callback)
  }

  var status = function(callback) {
    gitExecute('status --porcelain', function(result) {
        callback(result)
    })
  }

  var merge = function(branch, callback) {
    gitExecute('merge ' + branch, function(result, err) {
      callback(result, err)
    })
  }

  var mergeBase = function(branch, mergeToBranch, callback) {
    gitExecute('merge-base ' + branch + ' ' + mergeToBranch, function(result, err) {
      callback(result, err)
    })
  }

  var branchExists = function(branch, callback) {
    gitExecute('branch --list ' + branch, function(result) {
      callback(result)
    })
  }

  var branchList = function(callback) {
    gitExecute('branch --all', function(result) {
      callback(result)
    })
  }

  var fetch = function(callback) {
    gitExecute('fetch', callback)
  }

  return {
      commit: commit,
      jsonLog: jsonLog,
      log: log,
      init:init,
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
      branchExists : branchExists,
      merge: merge,
      mergeBase : mergeBase,
      branchList: branchList,
      fetch: fetch
    }
}
