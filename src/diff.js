var diff = function(base, left, right) {
  var properties = getUniqueProperties(base, left, right)

  var difference = {

  }

  for (var property of properties) {

    if (Array.isArray(base[property])){
        continue
    }

    var statusField = '$' + property + '_status'

    if (isObject(base[property]) || isObject(left[property]) || isObject(right[property])) {
      if (!left[property]) {
        if (!base[property]) {
          difference[property] = right[property]
          difference[statusField] = 'new'
        } else {
          difference[statusField] = 'removed'
        }
      } else if (!right[property]) {
        if (!base[property]) {
          difference[property] = left[property]
          difference[statusField] = 'new'
        } else {
          difference[statusField] = 'removed'
        }
      } else {
        difference[property] = diff(base[property], left[property], right[property])
      }

      continue
    }

    var status
    var value

    if (!right[property]) {
      if (!base[property]) {
        status = 'new'
        value = left[property]
      } else {
        status = 'removed'
      }
    } else if (!left[property]) {
      if (!base[property]) {
        status = 'new'
        value = right[property]
      } else {
        status = 'removed'
      }
    } else if (left[property] && right[property] && left[property] === right[property]) {
      status = 'same'
    } else {
      status = 'changed'

      if (left[property] === base[property]) {
          value = right[property]
      } else if (right[property] === base[property]) {
        value = left[property]
      } else {
        status = 'conflict'
        value = base[property]
      }
    }

    difference[statusField] = status

    if (status !== 'removed') {
      difference[property] = value
    }
  }

  return difference
}

var getUniqueProperties = function(base, left, right) {
  var baseProperties = Object.getOwnPropertyNames(base)
  var leftProperties = Object.getOwnPropertyNames(left)
  var rightProperties = Object.getOwnPropertyNames(right)

  var properties = baseProperties.concat(leftProperties).concat(rightProperties)
  return arrayUnique(properties)
}

var isObject = function(property) {
  return typeof(property) === 'object'
}

var arrayUnique = function(a) {
    return a.reduce(function(p, c) {
        if (p.indexOf(c) < 0) p.push(c)
        return p
    }, [])
}

module.exports = diff
