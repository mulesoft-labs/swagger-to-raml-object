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
    if (auth.type === "oauth2") {
      var obj = {
        oauth2: {
          type: "OAuth 2.0",
          describedBy: {},
          settings: {}
        }
      };
      obj.oauth2.settings = {
        authorizationUri: {},
        accessTokenUri: {},
        authorizationGrants: ["code", "token"] // can be "code", "token", "owner" or "credentials"
      };
      if (auth.scopes) { obj.oauth2.settings.scopes = _(auth.scopes).cloneDeep(); }
      var passAs = obj.oauth2.describedBy[auth.passAs];
      var keyname = false;
      if (passAs === "header") keyname = "headers";
      if (passAs === "query") keyname = "queryParameters"
      if (keyname) obj.oauth2.describedBy[keyname] = {type: "string"};
      ramlObj.securitySchemes.push(obj);
    }
  };

  var addAuthorizationObjects = function(authorizations) {
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
