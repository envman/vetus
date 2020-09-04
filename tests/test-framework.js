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
  return new Promise((resolve, reject) => {
    collection.data = data
    collection.save('commit', function(result, err) {
      if (err) return reject(err)
      resolve(collection)
    })
  })
}

module.exports.load = function(collection) {
  return new Promise((resolve, reject) => {
    collection.load(function(result, err) {
      if (err) return reject(err)
      resolve(collection)
    })
  })
}

module.exports.history = function(collection) {
  return new Promise((resolve, reject) => {
    collection.history(function(history, err) {
      if (err) return reject(err)
      resolve(history)
    })
  })
}

module.exports.createBranch = function(collection, newbranch) {
  return new Promise((resolve, reject) => {
    collection.createBranch(newbranch, function(result, err) {
      if (err) return reject(err)
      resolve(collection)
    })
  })
}

module.exports.merge = function(collection, fromBranch) {
  return new Promise((resolve, reject) => {
    collection.merge(fromBranch, function(err) {
      if (err) return reject(err)
      resolve(collection)
    })
  })
}

module.exports.branchList = function(collection) {
  return new Promise((resolve, reject) => {
    collection.branchList(function(list, err) {
      if (err) return reject(err)
      resolve({ collection: collection, list: list })
    })
  })
}

module.exports.changeBranch = function(collection, newbranch) {
  return new Promise((resolve, reject) => {
    collection.changeBranch(newbranch, function(result, err) {
      if (err) return reject(err)
      resolve(collection)
    })
  })
}

module.exports.deleteBranch = function(collection, branchToDelete) {
  return new Promise((resolve, reject) => {
    collection.deleteBranch(branchToDelete, function(result, err) {
      if (err) return reject(err)
      resolve(collection)
    })
  })
}

module.exports.revertHard = collection => new Promise((resolve, reject) => {
  collection.revertHard((result, err) => {
    if (err) return reject(err)
    resolve(collection)
  })
})
