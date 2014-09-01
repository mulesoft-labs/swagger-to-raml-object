var _ = require('lodash');

var parseResourceListing = function(resourceListing, ramlObj) {
  resourceListing = resourceListing || {};
  ramlObj = ramlObj || {documentation: []};

  var convertInfo = function(info) {
    ramlObj.title = info.title;
    // RAML has no analogous top-level description, so use "documentation"
    if (info.description) ramlObj.documentation.push({
      title: "description",
      content: info.description
    });
    if (info.termsOfServiceUrl) ramlObj.documentation.push({title: "termsOfServiceUrl", content: info.termsOfServiceUrl});
    if (info.contact) ramlObj.documentation.push({title: "contact", content: info.contact});
    if (info.license) ramlObj.documentation.push({title: "license", content: info.license});
    if (info.licenseUrl) ramlObj.documentation.push({title: "licenseUrl", content: info.licenseUrl});
  }

  if (resourceListing.info) { convertInfo(resourceListing.info); }
  return ramlObj;
}

module.exports = {};
module.exports.resourceListing = parseResourceListing;
