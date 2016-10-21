let splat = require('./../src/splat-split')
let assert = require('./assert')

describe('when shit gets splatted', function() {
  let obj = {
    name: 'hello',
    child: {
      name: 'sub hello'
    },
    array: [
      'string'
    ]
  }

  let disk = splat(obj)

  it('should write a prop in the right path', function() {
    assert.value(disk.files['name'], 'hello')
  })

  it('should write a sub object prop', function() {
    assert.value(disk.files['child/name'], 'sub hello')
  })
})
