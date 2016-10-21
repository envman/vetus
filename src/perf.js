let splat = require('./splat')
let gloop = require('./gloop')
let path = require('path')
let fs = require('fs')
let rimraf = require('rimraf')

console.time('read-json')
let surveyJson = fs.readFileSync(path.join(__dirname, 'survey.json'), 'utf-8')
let survey = JSON.parse(surveyJson)
console.timeEnd('read-json')

console.time('write-json')
fs.writeFileSync(path.join(__dirname, 'survey.json2'), JSON.stringify(survey, null, 2))
console.timeEnd('write-json')

let dir = './../temp'

rimraf.sync(dir)

console.time('splat')
splat(survey, dir, function() {

  console.timeEnd('splat')
  console.time('gloop')
  gloop(dir, function(o) {
    console.timeEnd('gloop')


  })
})
