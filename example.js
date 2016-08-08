var vetus = require('./app')

// Create a collection
vetus.collection({ name: 'collection-name', user: 'user-name' }, function(collection) {

  collection.data.test = {
    name: 'test-document'
  }

  collection.save(err, 'commit-message', function() {
    if (err) {
      throw err?
    }

    res.send('OK')
  })
})

// Load some data
vetus.collection({ name: 'collection-name', user: 'user-name' }, function(collection) {

  collection.load(function(err) {
    if (err) {
      res.status(bad)
      return
    }

    res.json(collection.data.test)
  })
})

// Update some data
vetus.collection({ name: 'collection-name', user: 'user-name' }, function(collection) {

  collection.load(function(err) {
    if (err) {
      res.status(bad)
      return
    }

    collection.data.test = updated

    collection.save(function(saveErr) {

    })
  })
})

// Update some data
vetus.collection({ name: 'collection-name', user: 'user-name' }, function(collection) {

  collection.merge('other', function(conflicts, merged) {
    if (conflicts) {
      return merged
    }
  })

  collection.load(function(err) {
    if (err) {
      res.status(bad)
      return
    }

    collection.data.test = updated

    collection.save(function(saveErr) {

    })
  })
})
