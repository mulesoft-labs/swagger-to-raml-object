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
  var result = JSON.parse(content);

  if (!result.swaggerVersion) {
    throw new Error('Swagger version is required');
  }

  return result;
}
