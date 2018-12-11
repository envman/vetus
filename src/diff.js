const diff = function(base, left, right) {
  let properties = getUniqueProperties(base, left, right)

  let difference = {

  }

  for (let property of properties) {

    if (Array.isArray(base[property])){
        continue
    }

    let statusField = '$' + property + '_status'

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

    let status
    let value

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

const getUniqueProperties = function(base, left, right) {
  let baseProperties = Object.getOwnPropertyNames(base)
  let leftProperties = Object.getOwnPropertyNames(left)
  let rightProperties = Object.getOwnPropertyNames(right)

  let properties = baseProperties.concat(leftProperties).concat(rightProperties)
  return arrayUnique(properties)
}

const isObject = function(property) {
  return typeof(property) === 'object'
}

const arrayUnique = function(a) {
    return a.reduce(function(p, c) {
        if (p.indexOf(c) < 0) p.push(c)
        return p
    }, [])
}

module.exports = diff
