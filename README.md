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

  collection.save('Updated my object', function() {
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

### Delete a branchList
```javascript
vetus.collection({name: 'collection', user: 'user', branch: 'master'}, function(collection) {
  collection.deleteBranch('my_branch', function() {
    res.send('OK')
  })
})
```
- Make sure collection branch is not the branch you want to delete
- May be some issues with this currently as other users branches are removed when they load next (via fetch --prune)

### Planned Features
- Object Graph History
- Object Merge Resolution
- Diff Branches
- Better Logging (:D)

### Things to maybe look at
- Document Indexing (in collection?)
- Merge of collections
- Split collection
- Cross collection search (maybe use index stuff? O_o)
- Better define what collections are supposed to be used for

### Collections
A collection is used to store multiple documents that version together, possibly later there should be a higher abstraction for
documents that should be searchable together, this would allow for different document types to be stored. Don't really have to worry
about this until search is implemented. This could just be a seperate vetus path tbh.

## Contributors
- Jamie Mahoney (https://github.com/mahoneyj2)
- Isak Falk (https://github.com/IsakFalk)
- Robert Gill (https://github.com/envman)
