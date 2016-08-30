var assert = require('chai').assert
var historyGenerator = require('./../src/history-generator')

describe('When generating history', function() {

  var objects1 = [
    {
      name: 'first',
      $commit: {
        author: 'jamie',
        date: '1/1/12'
      }
    },

    {
      name: 'second',
      $commit: {
        author: 'rob',
        date: '2/2/12'
      }
    },
  ]

  var history1 = historyGenerator(objects1)

  var objects2 = [
    {
      name: 'first',
      $commit: {
        author: 'jamie',
        date: '1/1/12'
      }
    },

    {
      name: 2,
      $commit: {
        author: 'rob',
        date: '2/2/12'
      }
    },
  ]

  var history2 = historyGenerator(objects2)

  var objects3 = [
    {
      name: 'first',
      $commit: {
        author: 'rob',
        date: '2/2/12'
      }
    },
  ]

  var history3 = historyGenerator(objects3)

  var objects4 = [
    {
      name: 'first',
      $commit: {
        author: 'jamie',
        date: '1/1/12'
      }
    },

    {
      name: {
        subname: 'subfirst'
      },
      $commit: {
        author: 'rob',
        date: '2/2/12'
      }
    },
  ]

  var history4 = historyGenerator(objects4)

  var objects5 = [
    {
      name: {
        subname: 'subfirst'
      },
      $commit: {
        author: 'jamie',
        date: '1/1/12'
      }
    },

    {
      name: {
        subname: 'subsecond'
      },
      $commit: {
        author: 'rob',
        date: '2/2/12'
      }
    },
  ]

  var history5 = historyGenerator(objects5)

  var objects6 = [
    {
      name: {
        subname: 'subfirst'
      },
      $commit: {
        author: 'jamie',
        date: '1/1/12'
      }
    },

    {
      name: {
        subname: 2
      },
      $commit: {
        author: 'rob',
        date: '2/2/12'
      }
    },
  ]

  var history6 = historyGenerator(objects6)

  var objects7 = [
    {
      name: 'first',
      arr: [1, 2, 3],
      $commit: {
        author: 'jamie',
        date: '1/1/12'
      },
    },

    {
      name: 'second',
      arr: [1, 2, 4],
      $commit: {
        author: 'rob',
        date: '2/2/12'
      },
    },
  ]

  var history7 = historyGenerator(objects7)

  it('latest value shown', function() {
    assert(history1.name === 'second')
  })

  it('latest value shown', function() {
    assert(history1.$hist_name, '$hist_name node missing')
    assert(history1.$hist_name === 'Modified by rob at 2/2/12', '$hist_name incorrect value: ' + history1.$hist_name)
  })

  it('Type has been modified', function() {
    assert(history2.name === 2)
  })

  it('Type has been modified', function() {
    assert(history2.$hist_name, '$hist_name node missing')
    assert(history2.$hist_name === 'Modified by rob at 2/2/12, Type changed', '$hist_name incorrect value: ' + history2.$hist_name)
  })

  it('Data created', function() {
    assert(history3.name === 'first')
  })

  it('Data created', function() {
    assert(history3.$hist_name, '$hist_name node missing')
    assert(history3.$hist_name === 'Created by rob at 2/2/12', '$hist_name incorrect value: ' + history3.$hist_name)
  })

  it('Recursive, created', function() {
    assert(history4.name.subname === 'subfirst')
  })

  it('Recursive, created', function() {
    assert(history4.$hist_name, '$hist_name node missing')
    assert(history4.$hist_name === 'Created by rob at 2/2/12', '$hist_name incorrect value: ' + history4.$hist_name)
    assert(history4.name.$hist_subname, '$hist_name node missing')
    assert(history4.name.$hist_subname === 'Created by rob at 2/2/12', '$hist_name incorrect value: ' + history4.name.$hist_name)
  })

  it('Recursive, modified', function() {
    assert(history5.name.subname === 'subsecond')
  })

  it('Recursive, modified', function() {
    assert(history5.$hist_name, '$hist_name node missing')
    assert(history5.$hist_name === 'Modified by rob at 2/2/12', '$hist_name incorrect value: ' + history5.$hist_name)
    assert(history5.name.$hist_subname, '$hist_name node missing')
    assert(history5.name.$hist_subname === 'Modified by rob at 2/2/12', '$hist_name incorrect value: ' + history5.name.$hist_name)
  })

  it('Recursive, modified, type of leaf changed', function() {
    assert(history6.name.subname === 2)
  })

  it('Recursive, modified, type of leaf changed', function() {
    assert(history6.$hist_name, '$hist_name node missing')
    assert(history6.$hist_name === 'Modified by rob at 2/2/12', '$hist_name incorrect value: ' + history6.$hist_name)
    assert(history6.name.$hist_subname, '$hist_name node missing')
    assert(history6.name.$hist_subname === 'Modified by rob at 2/2/12, Type changed', '$hist_name incorrect value: ' + history6.name.$hist_name)
  })

  it('Array changed', function() {
    assert(history7.$hist_name, '$hist_name node missing')
    assert(history7.$hist_array_arr === 'Updated by rob at 2/2/12', '$hist_name incorrect value: ' + history7.$hist_name)
  })

})
