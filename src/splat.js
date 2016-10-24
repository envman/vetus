let fs = require('fs')
var Promise = require('bluebird')
let getProperties = require('./get-props')
let path = require('path')
let mkdirp = require('mkdirp')
let farmhash = require('farmhash')
let sha1 = require('sha1')

module.exports = function(obj, root, callback) {

  let hashPath = path.join(root, 'hash')
  let inCache = JSON.parse(fs.readFileSync(path.join(root, 'hash'), 'utf-8'))
  let outCache = split(obj, root, inCache)
  fs.writeFileSync(hashPath, JSON.stringify(outCache, null, 2))
  
  callback()
}

let split = function(obj, root, inCache, cache) {
  root = root || ''
  cache = cache || {}

  for (let prop of getProperties(obj)) {
    if (typeof(obj[prop]) === 'object') {
      let newRoot
      if (Array.isArray(obj[prop])) {
        newRoot = path.join(root, '__' + prop)
      } else {
        newRoot = path.join(root, prop)
      }
      mkdirp.sync(newRoot)

      split(obj[prop], newRoot, inCache, cache)
    } else {
      let thePath = path.join(root, prop)

      let hash = sha1(obj[prop].toString())
      cache[thePath] = hash
      if (inCache[thePath] !== hash) {
        fs.writeFileSync(thePath, obj[prop])
      }
    }
  }

  return cache
}
