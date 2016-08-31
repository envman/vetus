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
		var arrayProperty = '$hist_array_' + propertyName

		// split into cases: if array
		if (Array.isArray(obj[propertyName])) {
			if (!history[propertyName]) {
				history[propertyName] = []
				history['$hist_' + propertyName] = '??'
			}

			for (let index in obj[propertyName]) {	
				let item = obj[propertyName][index]

				if (history[propertyName].length <= index) {
					console.log('create hist')
					let historyItem = { $hist_arr: 'Created..' }
					compareJson(item, historyItem, commit)
					history[propertyName].push(historyItem)
				} else {
					console.log('read hist')
					let historyItem = history[propertyName][index]
					var itemModified = compareJson(item, historyItem, commit)
					if (itemModified) {
						historyItem['$hist_arr'] = 'Updated..'
					}
				}
			}
		} else {
		// base case: if we are at leaf, need to include array here
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
	}

	return modified
}
