describe('Vetus Tests', function() {
  this.timeout(10000)
  require('./tests/create')
  require('./tests/load')
  require('./tests/update')
  require('./tests/users')
})
