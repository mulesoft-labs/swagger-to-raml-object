var _ = require('lodash');

var parseResourceListing = function(resourceListing, ramlObj) {
  resourceListing = resourceListing || {};
  ramlObj = ramlObj || {};

  var convertInfo = function(info) {
    if (!ramlObj.documentation) ramlObj.documentation = [];
    ramlObj.title = info.title;
    // RAML has no analogous top-level description, so use "documentation"
    _(["description", "termsOfServiceUrl", "contact", "license", "licenseUrl"])
    .each(function(item) {
      if (info[item]) ramlObj.documentation.push({title: item, content: info[item]});
    });
  };

  var addResourceObjects = function(apis) {
    if (!ramlObj.resources) ramlObj.resources = [];
    _(apis).each(function(api) {
      ramlObj.resources.push({relativeUri: api.path, description: api.description})
    });
  };

  addResourceObjects(resourceListing.apis);
  if (resourceListing.info) { convertInfo(resourceListing.info); }
  if (resourceListing.swaggerVersion) {
    ramlObj.documentation.push({
      title: "swaggerVersion",
      content: resourceListing.swaggerVersion
    });
  }
  if (resourceListing.apiVersion) { ramlObj.version = resourceListing.apiVersion };
  return ramlObj;
};

module.exports = {};
module.exports.resourceListing = parseResourceListing;
