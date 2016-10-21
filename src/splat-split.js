let getProperties = require('./get-props')
let path = require('path')

module.exports = function splat(obj, disk, root) {
  disk = disk || { files: {}, paths: [] }
  root = root || ''

  for (let prop of getProperties(obj)) {
    if (typeof(obj[prop]) === 'object') {
      let newRoot
      if (Array.isArray(obj[prop])) {
        newRoot = path.join(root, '__' + prop)
      } else {
        newRoot = path.join(root, prop)
      }
      splat(obj[prop], disk, newRoot)
      disk.paths.push(newRoot)
    } else {
      disk.files[path.join(root, prop)] = obj[prop]
    }
  }

  return disk
}
