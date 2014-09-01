var _ = require('lodash');

var parseResourceListing = function(resourceListing, ramlObj) {
  resourceListing = resourceListing || {};
  ramlObj = ramlObj || {};

  var convertInfo = function(info) {
    if (!ramlObj.documentation) { ramlObj.documentation = []; }
    ramlObj.title = info.title;
    // RAML has no analogous top-level description, so use "documentation"
    _(["description", "termsOfServiceUrl", "contact", "license", "licenseUrl"])
    .each(function(item) {
      if (info[item]) ramlObj.documentation.push({title: item, content: info[item]});
    });
  };

  var addResourceObjects = function(apis) {
    if (!ramlObj.resources) { ramlObj.resources = []; }
    _(apis).each(function(api) {
      ramlObj.resources.push({relativeUri: api.path, description: api.description})
    });
  };

  var addAuthorizationObject = function(auth) {
    if (!ramlObj.securitySchemes) { ramlObj.securitySchemes = []; }
    if (auth.oauth2) {
      if (auth.oauth2.passAs === "header") {

      } else if (auth.oauth2.passAs === "query") {

      }
      var obj = {
        oauth2: {
          type: "OAuth 2.0",
          describedBy: {},
          settings: {}
        }
      };
      obj.settings = {
        authorizationUri: {},
        accessTokenUri: {},
        authorizationGrants: ["code", "token"]
      };
      var passAs = obj.describedBy[auth.oauth2.passAs];
      var keyname = "default";
      if (passAs === "header") keyname = "headers";
      if (passAs === "query") keyname = "queryParameters"
      obj.describedBy[passAs] = {type: "string"};
      ramlObj.securitySchemes.push(obj);
    }
  };

  var addAuthorizationObjects = function(authorizations) {
    authType = "oauth2";
    _(authorizations).each(function(x) { addAuthorizationObject(x); });
  };

  addResourceObjects(resourceListing.apis);
  addAuthorizationObjects(resourceListing.authorizations);
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
