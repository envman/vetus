var path = require('path')
var Repository = require('./repository')
var settings = require('./settings')

module.exports = function(options) {
  var root = settings.path

  var repo

  var getPath = function() {

  }

  var load = function() {

  }

  var save = function () {
    if (!repo) {
      repo = new Repository()
    }
  }

  return {
    data: {},
    load: load,
    save: save
  }
}
