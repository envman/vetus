describe('Vetus Tests', function() {
  this.timeout(40000)
  require('./tests/update')
  require('./tests/users')
  require('./tests/branch')
  require('./tests/delete')
  require('./tests/merge')
  require('./tests/revert-hard')
  // require('./tests/conflict') // conflict not supported yet
  // require('./tests/diff'),
  // require('./tests/diff-child-properties'),
  // require('./tests/diff-array')
  // require('./tests/history') // need to fix issues with history generator
  // require('./tests/history-generator')
})
