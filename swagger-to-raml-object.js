var _ = require('lodash');

var parseResourceListing = function(resourceListing, ramlObj) {
  resourceListing = resourceListing || {};
  ramlObj = ramlObj || {};

  var convertInfo = function(info) {
    if (!info.title) throw "Invalid Swagger Resource Listing: title is a required property of info";
    ramlObj.title = info.title;
    console.log("ramlObj: ", ramlObj);
    if (!info.description) throw "Invalid Swagger Resource Listing: description is a required property of info";
    // RAML has no analogous top-level description
  }

  if (resourceListing.info) { convertInfo(resourceListing.info); }
  return ramlObj;
}

module.exports = {};
module.exports.resourceListing = parseResourceListing;
