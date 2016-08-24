var fs = require('fs')
var path = require('path')
var rimraf = require('rimraf').sync

var testDirectory = path.join(__dirname, '..', '..', 'test-temp')

var vetus = require('./../app')({ path: testDirectory })
var framework = new require('./test-framework')

var testData

if (fs.existsSync(testDirectory)) {
  rimraf(testDirectory)
}

fs.mkdirSync(testDirectory)

var data = {
  first: {name: 'first'}
}

var updated = {
  first: {name: 'updated'}
}

framework.collection()
  .then(c => framework.save(c, data))
  .then(c => framework.load(c))
  .then(c => framework.save(c, updated))
  .then(c => framework.load(c))
  .then(c => testData = c.data)
  .then(c => done())
