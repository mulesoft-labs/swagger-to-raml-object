/**
 * Export the resource listing check.
 */
module.exports = isResourceListing;

/**
 * Check whether an object is a resource listing.
 *
 * @param  {Object}  resource
 * @return {Boolean}
 */
function isResourceListing (resource) {
  return !resource.basePath;
}
