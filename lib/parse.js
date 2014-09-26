/**
 * Expose the parse module.
 */
module.exports = parse;

/**
 * Parse the content based on the file name.
 *
 * @param  {String} content
 * @return {Object}
 */
function parse (content) {
  return JSON.parse(content);
}
