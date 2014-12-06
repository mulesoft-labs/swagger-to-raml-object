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
  var parts = Array.prototype.reduce.call(arguments, function (path, segment) {
    var parts = splitSegment(segment);

    if (hasProtocol(segment)) {
      return parts;
    }

    return path.concat(parts);
  }, []);

  var index = 0;

  while (index < parts.length) {
    var part = parts[index];

    if (part === '' || part === '.') {
      parts.splice(index, 1);
    } else if (part === '..') {
      parts.splice(index - 1, 2);
      index--;
    } else {
      index++;
    }
  }

  return parts.join('/');
}

/**
 * Split a path into parts.
 *
 * @param  {String} segment
 * @return {Array}
 */
function splitSegment (segment) {
  if (!hasProtocol(segment)) {
    return segment.replace(/^\/+/, '').split(/\/+/g);
  }

  var proto = segment.match(/^\w+:\/\//)[0];
  var index = segment.substr(proto.length).indexOf('/');

  // No URL path.
  if (index === -1) {
    return [segment];
  }

  var pathIndex = proto.length + index;
  var parts     = splitSegment(segment.substr(pathIndex));
  var origin    = segment.substr(0, pathIndex);

  return [origin].concat(parts);
}

/**
 * Check if the path begins with a protocol.
 *
 * @param  {String}  path
 * @return {Boolean}
 */
function hasProtocol (path) {
  return /^\w+:\/\//.test(path);
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
