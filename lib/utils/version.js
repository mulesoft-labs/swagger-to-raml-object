/**
 * Export version function.
 */
module.exports = version;

/**
 * Retrieve the Swagger version from a specification.
 *
 * @param  {Object} declaration
 * @return {Number}
 */
function version (declaration) {
  return parseFloat(declaration.swaggerVersion || declaration.swagger);
}
