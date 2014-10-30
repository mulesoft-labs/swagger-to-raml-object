/**
 * Export the resolve function.
 */
module.exports = resolve;

/**
 * Resolve a series of path segments.
 *
 * @return {String}
 */
function resolve () {
  return Array.prototype.reduce.call(arguments, function (path, part) {
    if (hasProtocol(part)) {
      return part;
    }

    if (isAbsolute(part)) {
      return path + part;
    }

    return path + '/' + part;
  });
}

/**
 * Check if the path begins with a protocol.
 *
 * @param  {String}  path
 * @return {Boolean}
 */
function hasProtocol (path) {
  return /^\w+:\//.test(path);
}

/**
 * Check if a path is absolute.
 *
 * @param  {String}  path
 * @return {Boolean}
 */
function isAbsolute (path) {
  return /^\//.test(path);
}
