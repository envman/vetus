# vetus

A versioned json object store based on git (Currently in development)

### Terms
- name: the name of the collection, allows you to have multiple object stores one is always required
- user: the name of the user accessing the document, if none is supplied a default user is used
- branch: the branch to perform the operation on, if none is supplied the default master is used

`npm install vetus`

Require vetus
```javascript
var vetus = require('vetus')({path: './localDirectory'})
```
- the path is the local folder to use for disk storage

### Save objects

```javascript
vetus.collection({name: 'collection', user: 'user', branch: 'branch'}, function(collection) {
  // data object can have as many properties as you like, each property is saved as separate document
  collection.data.myObject = obj

  collection.save(message, function() {
    res.send('OK')
  })
})
```

### Load objects
```javascript
vetus.collection({ name: 'collection', user: 'user', branch: 'branch' }, function(collection) {
  collection.load(function() {
    res.json(collection.data.myObject)
  })
})
```

## Branches
Branches are designed to be used globally rather than local/remote

### Create a branch
Where master is the branch to create from

```javascript
vetus.collection({name: 'collection', user: 'user', branch: 'master'}, function(collection) {
  collection.createBranch('my_branch', function() {
    res.send('OK')
  })
})
```

### Get a list of branches
```javascript
vetus.collection({name: 'collection', user:'user'}, function(collection) {
  collection.branchList(function(list) {
    res.json(list)
  })
})
```

### Planned Features
- Branch Deletion
- Object Graph History
- Object Merge Resolution
- Diff Branches
- Better Logging (:D)

## Contributors
- Jamie Mahoney (https://github.com/mahoneyj2)
- Isak Falk (https://github.com/IsakFalk)
- Robert Gill (https://github.com/envman)
