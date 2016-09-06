module.exports = function(objects, history) {
	history = history || {}

	for (var obj of objects) {
		console.log(obj)
		updateJson(obj, history)
		console.log(history)
	}

	return history
}

var updateJson = function(obj, history) {
 	var commit = obj.$commit
 	delete obj.$commit

	deleteJson(obj, history, commit)
 	compareJson(obj, history, commit)
}

var deleteJson = function(obj, history, commit) {

	var deleted = false

	if (history === {}) {
		return deleted
	}

	if (Array.isArray(history)) {
		// need to sort out, not implemented for arrays
		for (var index in history) {
			deleteJson(obj[index], history[index], commit)
		}
	} else {

	  var hist_keys = Object.keys(history).sort()
		var obj_keys = Object.keys(obj).sort()
		var intersect_keys_set = new Set([...hist_keys,...obj_keys])
		var intersect_keys = [...intersect_keys_set].sort()

		for (var key in hist_keys) {
			if (intersect_keys.indexOf(key) == -1) {
				// item has been removed
				deleted = true
				delete history.key
				delete history['$hist_' + key]
			}
			// need to filter so that we call deleteJson recursively if still in tree, stops if at leaf
			// loop over all of the keys
			for (var key in history) {
				if (typeof(obj[key]) == 'object') {
					deleteJson(obj[key], history[key], commit)
				} else {
					return deleted
				}
			}
		}
	}
}

var compareJson = function(obj, history, commit) {

	console.log('obj', obj)

  var modified = false

	let filtered = Object.getOwnPropertyNames(obj)
		.filter(p => p.indexOf('$') < 0)

  for (var propertyName of filtered) {

  	var historyProperty = '$hist_' + propertyName

		// split into cases: if array
		if (Array.isArray(obj[propertyName])) {
			let created = false

			if (!history[propertyName]) {
				created = true
				history[propertyName] = []
				history[historyProperty] = 'Created by ' + commit.author + ' at ' + commit.date
			}

			for (let index in obj[propertyName]) {
				let item = obj[propertyName][index]

				if (String(item).startsWith('$')) {
					continue
				}

				if (history[propertyName].length <= index) {
					let historyItem = {}
					if (created === true) {
						historyItem['$hist_array'] = 'Created by ' + commit.author + ' at ' + commit.date
					}
					let modified = compareJson(item, historyItem, commit)
					if (modified && created === false) {
						historyItem['$hist_array'] = 'Updated by ' + commit.author + ' at ' + commit.date
						history[historyProperty] = 'Modified by ' + commit.author + ' at ' + commit.date
					}
					history[propertyName].push(historyItem)
				} else {
					let historyItem = history[propertyName][index]
					var itemModified = compareJson(item, historyItem, commit)
					if (itemModified) {
						historyItem['$hist_array'] = 'Updated by ' + commit.author + ' at ' + commit.date
						history[historyProperty] = 'Modified by ' + commit.author + ' at ' + commit.date
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
