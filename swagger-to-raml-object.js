"use strict";

var _ = require('lodash');

var parseResourceListing = function(resourceListing, ramlObj) {
  resourceListing = resourceListing || {};
  ramlObj = ramlObj || {};

  var convertInfo = function(info) {
    if (!ramlObj.documentation) {
      ramlObj.documentation = [];
    }
    ramlObj.title = info.title;
    // RAML has no analogous top-level description, so use "documentation"
    ramlObj.documentation = _(info)
      .pick(['description', 'termsOfServiceUrl', 'contact', 'license', 'licenseUrl'])
      .map(function (value, name) { return {title: name, content:value}; })
      .value();
  };

  var addResourceObjects = function(apis) {
    if (!ramlObj.resources) {
      ramlObj.resources = [];
    }
    _(apis).each(function(api) {
      ramlObj.resources.push({relativeUri: api.path, description: api.description});
    });
  };

  var addImplicitGrantType = function(swaggerImplicit, ramlSettings) {
    // Mutates ramlSettings passed in.  Destructive!
    var input = swaggerImplicit;
    if (input && input.loginEndpoint && input.loginEndpoint.url) {
      ramlSettings.authorizationUri = input.loginEndpoint.url;
    }
    if (input.tokenName) {
      ramlSettings.documentation = ramlSettings.documentation || [];
      ramlSettings.documentation.push({implicit_grant_token_name: input.tokenName});
    }
    ramlSettings.authorizationGrants = _.union(ramlSettings.authorizationGrants, ['token']);
  };

  var addAuthorizationCode = function(swaggerAuthCode, ramlSettings) {
    // Mutates ramlSettings passed in.  Destructive!
    var tokenRequestEndpoint = swaggerAuthCode.tokenRequestEndpoint;
    var tokenEndpoint = swaggerAuthCode.tokenEndpoint;
    ramlSettings.authorizationUri = tokenRequestEndpoint.url;
    ramlSettings.accessTokenUri = tokenEndpoint.url;
    // Place optional Swagger fields into settings documentation
    if (tokenRequestEndpoint.clientIdName) {
      ramlSettings.documentation = ramlSettings.documentation || [];
      ramlSettings.documentation.push(
        {authcode_client_id_name: tokenRequestEndpoint.clientIdName});
    }
    if (tokenRequestEndpoint.clientSecretName) {
      ramlSettings.documentation = ramlSettings.documentation || [];
      ramlSettings.documentation.push(
        {authcode_client_secret_name: tokenRequestEndpoint.clientSecretName});
    }
    if (tokenEndpoint.tokenName) {
      ramlSettings.documentation = ramlSettings.documentation || [];
      ramlSettings.documentation.push({authcode_token_name: tokenEndpoint.tokenName});
    }
    ramlSettings.authorizationGrants = _.union(ramlSettings.authorizationGrants, ['code'])
  };

  var addAuthorizationObject = function(auth) {
    var obj = {}; // obj to be built and pushed to security schemes
    if (!ramlObj.securitySchemes) {
      ramlObj.securitySchemes = [];
    }
    if (auth.type === 'oauth2') {
      if (!auth.grantTypes) {
        return;  // without grant types, the Oauth2 declaration is not needed
      }
      obj.oauth2 = {
        type: 'OAuth 2.0',
        describedBy: {},
        settings: {}
      };
      obj.oauth2.settings = {
        authorizationUri: {},
        accessTokenUri: {},
        authorizationGrants: [] // can be 'code', 'token', 'owner' or 'credentials'
      };
      if (auth.grantTypes.implicit) {
        addImplicitGrantType(auth.grantTypes.implicit, obj.oauth2.settings);
      }
      if (auth.grantTypes.authorization_code) {
        addAuthorizationCode(auth.grantTypes.authorization_code, obj.oauth2.settings);
      }
      if (auth.scopes) {
        obj.oauth2.settings.scopes = _(auth.scopes).pluck('scope').value();
      }
    } else if (auth.type === 'basicAuth') {
      obj.basic = {
        type: "Basic Authentication",
        describedBy: {},
        settings: {}
      };
    } else if (auth.type === 'apiKey') {
      var keyname = 'default';

      obj.apiKey = {
        type: "x-ApiKey",
        describedBy: {}
      }
      if (auth.passAs === 'header') {
        keyname = 'headers';
      }
      if (auth.passAs === 'query') {
        keyname = 'queryParameters';
      }
      if (auth.passAs) {
        obj.apiKey.describedBy[keyname] = {type: 'string'};
      }

    }

    ramlObj.securitySchemes.push(obj);
  };

  var addAuthorizationObjects = function(authorizations) {
    _(authorizations).each(function(x) { addAuthorizationObject(x); });
  };

  // Begin building RAML object
  addResourceObjects(resourceListing.apis);
  addAuthorizationObjects(resourceListing.authorizations);
  if (resourceListing.info) {
    convertInfo(resourceListing.info);
  }
  if (resourceListing.swaggerVersion) {
    ramlObj.documentation = ramlObj.documentation || [];
    ramlObj.documentation.push({
      title: 'swaggerVersion',
      content: resourceListing.swaggerVersion
    });
  }
  if (resourceListing.apiVersion) {
    ramlObj.version = resourceListing.apiVersion
  };
  return ramlObj;
};

exports.resourceListing = parseResourceListing;
