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

	deleteJson(obj, history, commit)
 	compareJson(obj, history, commit)
}

var deleteJson = function(obj, history, commit) {
	/* Assumes that the tree maintains its obj-array-obj-array-... structure
	 and never change into different things and also ends in objects
	 */

  var deleted = false

	if (Array.isArray(history)) {
		// Might not work if javascript can't compare equality of objects
		for (var index in history) {
			if (obj.indexOf(history[index]) === -1) {
				history.splice(index, 1)
			}	else {
				deleteJson(obj[index], history[index], commit)
			}
		}
	} else {

	  var hist_keys = Object.keys(history)
			.filter(p => p.indexOf('$') < 0)
		var obj_keys = Object.keys(obj)
			.filter(p => p.indexOf('$') < 0)

		for (var key of hist_keys) {
			if (obj_keys.indexOf(key) === -1) {
				deleted = true
				delete history[key]
			  delete history['$hist_' + key]
			}

			if (typeof(obj[key]) === 'object' || Array.isArray(obj[key])) {
				deleteJson(obj[key], history[key], commit)
			} else {
				return deleted
			}
		}
	}
}

// unique ID generator from online
var ID = function () {
  // Math.random should be unique because of its seeding algorithm.
  // Convert it to base 36 (numbers + letters), and grab the first 9 characters
  // after the decimal.
  return '' + Math.random().toString(36).substr(2, 9);
};

var compareJson = function(obj, history, commit) {
  var modified = false

	let filtered = Object.getOwnPropertyNames(obj)
		.filter(p => p.indexOf('$') < 0 || typeof(p.id) === 'undefined' ) // Not sure what this undefined check is for?

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

				if (history[propertyName].length - 1 < index) {
					// this branch creates a new element in history[propertyName]

					if (created === true){
						let historyItem = {}
						historyItem['$hist_array'] = 'Created by ' + commit.author + ' at ' + commit.date
						historyItem['id'] = ID()
						compareJson(item, historyItem, commit)
						history[propertyName].push(historyItem)
					}	else if (created === false && history[propertyName].length === 0) {
						let historyItem = {}
						historyItem['$hist_array'] = 'Updated by ' + commit.author + ' at ' + commit.date
						historyItem['id'] = ID()
						compareJson(item, historyItem, commit)
						history[propertyName].push(historyItem)
						history[historyProperty] = 'Modified by ' + commit.author + ' at ' + commit.date
					} else {
						let historyItem = {}
						historyItem['$hist_array'] = 'Updated by ' + commit.author + ' at ' + commit.date
						compareJson(item, historyItem, commit)
						history[propertyName].push(historyItem)
						history[historyProperty] = 'Modified by ' + commit.author + ' at ' + commit.date
					}
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
	    if (typeof(obj[propertyName]) != 'object') {
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
			} else {
			  if (!history[propertyName] || typeof(history[propertyName]) !== 'object') {
					history[historyProperty] =  "Created by " + commit.author + " at " + commit.date
					var childHistory = {}
			  	var childModified = compareJson(obj[propertyName], childHistory, commit)
			  	if (childModified) {
			  		history[propertyName] = childHistory
			  	}

			  	modified = true
					continue
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
