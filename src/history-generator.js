module.exports = function(objects) {
	var history = {}

	for (let obj of objects) {

	}

	return history
}

 var updateJson = function(oldCommitInfo, newCommitInfo, historyJson, callback) {
    // convert this commit to an obj
    branchToObj(newCommitInfo.commit, function(newCommitJson) {
      // compare the jsons, returns new updated json
      if (!oldCommitInfo.commit) {
        //console.log("INITIAL COMMIT")
        compareJson({}, newCommitJson, historyJson, newCommitInfo, function(modified, resultJson) {
          callback(resultJson)
        })
      } else {
        //console.log("UPDATING COMMIT")
        branchToObj(oldCommitInfo.commit, function(oldCommitJson) {
          compareJson(oldCommitJson, newCommitJson, historyJson, newCommitInfo, function(modified, resultJson) {
            callback(resultJson)
          })
        })
      }
    })
  }

  // Compares two json files with optional historyjson, returning the difference as a history JSON w/ commit info
  var compareJson = function(oldCommitJson, newCommitJson, historyJson, newCommitInfo, callback) {

    var modified = false

    // debug info (believe me its damn useful LOL)
    // console.log("Comparing jsons")
    // console.log("New: " + (typeof newCommitJson) + JSON.stringify(newCommitJson))
    // console.log("Old: " + (typeof oldCommitJson) + JSON.stringify(oldCommitJson))
    // console.log("Hist: " + (typeof historyJson) + JSON.stringify(historyJson))

    // Iterate through all the keys in newCommitJson, looking for new attributes 
    for (var i in newCommitJson) {

      // If the attribute doesnt exist in the old Json OR the old json isnt an object..
      if (!(typeof oldCommitJson == 'object') || !(i in oldCommitJson)) {
        newVersion = newCommitJson[i]
        console.log("New attribute " + i  + " - " + newCommitInfo.author + " at " + newCommitInfo.date)
        if (newVersion instanceof Array) {
            // The newversion is an array

            // TO DO ?!?! -  for loop of recursive calls w/ empty oldcommit

        } else if (typeof newVersion == 'object') {
          //The newversion is an object

          //Compare the children json with empty json - makes all children new basically
          compareJson({}, newVersion, {}, newCommitInfo, function(extractModified, jsonExtract) { 
            // Add parent history
            historyJson[i] = jsonExtract
            historyJson["$hist_" + i] = "Created by " + newCommitInfo.author + " at " + newCommitInfo.date
            modified = true
          })
        } else {
          // The newversion is a variable

          // Add it to the json and history 
          historyJson[i] = newVersion
          historyJson["$hist_" + i] = "Created with value '" + newVersion + "' by " + newCommitInfo.author + " at " + newCommitInfo.date
          modified = true
        }
      }
    }

    // Iterate through all the keys in oldCommitJson, looking for updates and deletions
    for (var i in oldCommitJson) {

      // The key exists in both the old and new object
      if (i in newCommitJson && (typeof newCommitJson == 'object')) {
        oldVersion = oldCommitJson[i]
        newVersion = newCommitJson[i]

        // The old ver is not equal to the new ver
        // Note - object comparison always returns false -> we need a 'modified' parameter in this circumstance 
        if (oldVersion !== newVersion) {
          // should be an index in history.json unless something is broken..
          console.log("Updated attribute " + i + " - " + newCommitInfo.author + " at " + newCommitInfo.date)
          
          // Additional information for any type conversion that occurs from old -> new
          typeConversion = ""
          if (typeof newVersion !== typeof oldVersion) {
            typeConversion = " - Changed type from " + (typeof oldVersion) + " to " + (typeof newVersion)
          } 

          if (newVersion instanceof Array) {
            // The newversion is an array

            // TO DO ?!?! -  for loop of recursive calls w/ empty oldcommit

            modified = true
          } else if (typeof newVersion == 'object') {
            // The newversion is an object

            // If the old version is not an object, its gotta be removed
            if (typeof oldVersion !== 'object') {
              oldVersion = {}
              historyJson[i] = {} 
            }

            // Compare the children json files, using the history for updates
            compareJson(oldVersion, newVersion, historyJson[i], newCommitInfo, function(extractModified, jsonExtract) {
              if (extractModified) {
                // The extract was modified from old -> new
                // Update parent history
                historyJson[i] = jsonExtract
                historyJson["$hist_" + i] = "Modified by " + newCommitInfo.author + " at " + newCommitInfo.date + typeConversion
                modified = true
              }
            })
          } else {
            // The newversion is a variable
            // Update variable & history
            historyJson[i] = newVersion
            historyJson["$hist_" + i] += "\nUpdated with value '" + newVersion + " by " + newCommitInfo.author + " at " + newCommitInfo.date + typeConversion
            modified = true
          }
        }
      } else {
        // The attribute was deleted
        if(historyJson[i]) {
          delete historyJson[i]
          modified = true
        }

        if (historyJson["$hist_" + i]) {
          delete historyJson["$hist_" + i]
          modified = true
        }
      }
    }

    // Return whether the json was modified + changed file
    callback(modified, historyJson)
  }
