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
    if (isAbsolute(part)) {
      return part;
    }

    return path + '/' + part;
  });
}

/**
 * Check if a path is absolute.
 *
 * @param  {String}  path
 * @return {Boolean}
 */
function isAbsolute (path) {
  return /^\/|^\w+:\//.test(path);
}
