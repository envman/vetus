const path = require('path')
const testDirectory = path.join(__dirname, '..', '..', 'test-temp')
const Promise = require('promise')

const vetus = require('./../app')({ path: testDirectory })

module.exports.collection = function(opts) {
  return new Promise((resolve, reject) => {
    opts = opts || {}
    opts.name = opts.name || 'test'

    vetus.collection(opts, function(collection) {
      resolve(collection)
    })
  })
}

module.exports.save = function(collection, data) {
  return new Promise((done, err) => {
    collection.data = data

    collection.save('commit', function(saveErr) {
      done(collection)
    })
  })
}

module.exports.load = function(collection) {
  return new Promise((done, err) => {

    collection.load(function() {
      done(collection)
    })
  })
}

module.exports.history = function(collection) {
  return new Promise((done, err) => {

    collection.history(function(history) {
      done(history)
    })
  })
}

module.exports.createBranch = function(collection, newbranch) {
  return new Promise((done, err) => {

    collection.createBranch(newbranch, function() {
      done(collection)
    })
  })
}

module.exports.merge = function(collection, fromBranch) {
  return new Promise((resolve, reject) => {
    collection.merge(fromBranch, function(err) {
      if (err) {
        return reject(err)
      }

      resolve(collection)
    })
  })
}

module.exports.branchList = function(collection) {
  return new Promise((done, err) => {

    collection.branchList(function(list) {
      done({ collection: collection, list: list })
    })
  })
}

module.exports.changeBranch = function(collection, newbranch) {
  return new Promise((done, err) => {

    collection.changeBranch(newbranch, function() {
      done(collection)
    })
  })
}

module.exports.deleteBranch = function(collection, branchToDelete) {
  return new Promise((done, err) => {

    collection.deleteBranch(branchToDelete, function() {
      done(collection)
    })
  })
}
