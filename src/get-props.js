module.exports = function(obj) {
  return Object.getOwnPropertyNames(obj)
    .filter(p => !p.startsWith('$'))
    .filter(p => !(Array.isArray(obj) && p === 'length'))
}
