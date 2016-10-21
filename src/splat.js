let fs = require('fs')
var Promise = require('bluebird')
let split = require('./splat-split')
let getProperties = require('./get-props')
let path = require('path')
let mkdirp = require('mkdirp')

// let write = Promise.denodeify(fs.writeFile)

module.exports = function(obj, root, callback) {
  let data = split(obj)
  // console.log(data)
  //
  // let data = { files:
  //  { name: 'hello',
  //    '__arr/0': '1',
  //    '__arr/1': '2',
  //    'sub/name': 'sub',
  //    'sub/child/name': 'child' },
  // paths: [ '__arr', 'sub/child' ] }

  let pathWrites = data.paths.map(p => new Promise(function(fulfill, reject) {
    mkdirp(path.join(root, p), function(err) {
      if (err) {
        mkdirp(path.join(root, p), function(err) {
          if (err) {
            console.log(err)
            reject(err)
          } else {
            fulfill()
          }
        })

      } else {
          fulfill()
      }
    })
  }))

  Promise.all(pathWrites)
    .then(() => {
      let promises = getProperties(data.files)
        .map(p => new Promise((fulfill, reject) => {
          fs.writeFile(path.join(root, p), data.files[p], function(err) {
            if (err) console.log(err)
            fulfill()
          })
        }))

        Promise.all(promises)
          .then(callback)
    })
  // let promises = getProperties(data.files)
  //   .map(p => write(path.join(root, p), data.files[p]))



  // console.log(data)

  // Promise.reduce(promises, function({}, prom) {
  //   console.log(prom)
  //   return prom
  // })
  //   .then(o => console.log('done'))



  // Promise.each(pathWrites).then(function() {
  //   console.log('lol')
  //   Promise.each(promises).then(function() {
  //     callback()
  //   })
  // })
}
