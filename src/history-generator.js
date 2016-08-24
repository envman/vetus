module.exports = function(objects, history) {
	history = history || {}

	for (var obj of objects) {
		updateJson(obj, history)
	}

	return history
}

var updateJson = function(obj, history) {
 	var commit = obj.$commit
 	delete obj.$commit

 	compareJson(obj, history, commit)
}

var compareJson = function(obj, history, commit) {

  var modified = false

  for (var propertyName in obj) {
  	var historyProperty = '$hist_' + propertyName

		// base case: if we are at leaf
    if (typeof(obj[propertyName]) != 'object') {
      // simple type
    	if (!history[propertyName]) {
		  	history[historyProperty] =  "Created by " + commit.author + " at " + commit.date
		  	history[propertyName] = obj[propertyName]
		  	modified = true
		  } else if (typeof(obj[propertyName]) != typeof(history[propertyName])) {
		  	history[historyProperty] =  "Modified by " + commit.author + " at " + commit.date + ', Type changed'
				history[propertyName] = obj[propertyName]
		  	modified = true
			} else if (obj[propertyName] != history[propertyName]) {
	  		history[historyProperty] =  "Modified by " + commit.author + " at " + commit.date
	  		history[propertyName] = obj[propertyName]
	  		modified = true
	  	}
		// else we check further down the tree
		} else {
			// obj is not at leaf, history is at leaf
		  if (!history[propertyName] || typeof(history[propertyName]) !== 'object') {
				history[historyProperty] =  "Created by " + commit.author + " at " + commit.date
				var childHistory = {}
		  	var childModified = compareJson(obj[propertyName], childHistory, commit)
		  	if (childModified) {
		  		history[propertyName] = childHistory
		  	}

		  	modified = true
				continue
			// obj is not at leaf, history is not at leaf
		  } else {
		  	var childModified = compareJson(obj[propertyName], history[propertyName], commit)
		  	modified = childModified
		  	if (childModified) {
		  		history[historyProperty] =  "Modified by " + commit.author + " at " + commit.date
		  	}

		  	continue
		  }
		}
	}
	return modified
}
