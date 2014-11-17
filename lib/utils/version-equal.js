/**
 * Export the function.
 */
module.exports = versionEqual;

/**
 * Check whether the new version is the same as the previous version.
 *
 * @param  {String}  currentVersion
 * @param  {String}  newVersion
 * @return {Boolean}
 */
function versionEqual (currentVersion, newVersion) {
  // Allow the new version to be empty.
  if (newVersion == null) {
    return true;
  }

  var newVersionNumber     = Number(newVersion);
  var currentVersionNumber = Number(currentVersion);

  // If both are valid numbers, compare as numbers.
  if (newVersionNumber && currentVersionNumber) {
    return newVersionNumber === currentVersionNumber;
  }

  // Compare directly as strings.
  return currentVersion === newVersion;
}
