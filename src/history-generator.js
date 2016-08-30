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
		var arrayProperty = '$hist_array' + propertyName

		// split into cases: if array
		if (Array.isArray(obj[propertyName])){
			arr_curr = obj[propertyName]
			arr_hist = history[propertyName]

			var hits = 0
			var leaf = true

			//check if we are at leaf
			for (var i in arr_curr) {
				if (typeof(arr_curr) === 'object' || Array.isArray(arr_curr[i])) {
					leaf = false
				}
			}

			if (leaf === true) {
				history[arrayProperty] = "Updated by " + commit.author + " at " + commit.date
				history[propertyName] = obj[propertyName]
				modified = true
			} else {

				// since the list might be jumbled, we loop over both, and check if they have the same elements
				for (var index_curr in arr_curr) {
					for (var index_hist in arr_hist) {
						if (arr_curr[index_curr] === arr_hist[index_hist]) {
							hits += 1
						}
					}
				}

				// if we don't have the same in obj and history, else we let it pass, or if history not the same as obj
				if (arr_curr.length !== arr_hist.length || hits != arr_curr.length ||  !Array.isArray(arr_hist)) {
					history[arrayProperty] = "Updated by " + commit.author + " at " + commit.date
					history[propertyName] = obj[propertyName]

					modified = true
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
