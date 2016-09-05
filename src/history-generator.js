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
		if (propertyName.startsWith('$')) {
			continue
		}
		console.log('Loop at propertyName: ', propertyName, ' which has attribute: ', obj[propertyName])
  	var historyProperty = '$hist_' + propertyName

		// split into cases: if array
		if (Array.isArray(obj[propertyName])) {
			if (!history[propertyName]) {
				history[propertyName] = []
				history[historyProperty] = 'Created by ' + commit.author + ' at ' + commit.date
			} else {
				console.log('In else branch, propertyName: ', propertyName, ', obj[propertyName]: ',  obj[propertyName],  ', entering compareJson method')
				var itemModified = compareJson(history[propertyName], obj[propertyName], commit)
				console.log('Outside of compareJson')
				if (itemModified) {
					history[historyProperty] = 'Updated by ' + commit.author + ' at ' + commit.date
				}
			}

			for (let index in obj[propertyName]) {
				let item = obj[propertyName][index]

				if (history[propertyName].length <= index) {
					let historyItem = {}
					historyItem['$hist_array'] = 'Created by ' + commit.author + ' at ' + commit.date
					compareJson(item, historyItem, commit)
					history[propertyName].push(historyItem)
				} else {
					let historyItem = history[propertyName][index]
					var itemModified = compareJson(item, historyItem, commit)
					if (itemModified) {
						historyItem['$hist_array'] = 'Updated by ' + commit.author + ' at ' + commit.date
					}
				}
			}
		} else {
		// base case: if we are at leaf, need to include array here
	    if (typeof(obj[propertyName]) != 'object') {
				// console.log('In object branch, obj[propertyName]: ', obj[propertyName], ', propertyName: ', propertyName)
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
