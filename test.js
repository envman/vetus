describe('Vetus Tests', function() {
  this.timeout(15000)
  require('./tests/create')
  require('./tests/load')
  require('./tests/update')
  require('./tests/users')
  require('./tests/branch')
  require('./tests/merge')
})
