var getVersion = require('./utils/version');

/**
 * Map swagger documentation keys into title-cased strings.
 *
 * @type {Object}
 */
var DOCUMENTATION_NAME_MAP = {
  description:       'Description',
  termsOfServiceUrl: 'Terms of Service URL',
  contact:           'Contact',
  license:           'License',
  licenseUrl:        'License URL'
};

/**
 * Map of Swagger OAuth 2.0 grant types to the RAML equivalents.
 *
 * @type {Object}
 */
var GRANT_TYPE_MAP = {
  implicit:           'token',
  authorization_code: 'code'
};

/**
 * Map of ways to pass API keys in Swagger to RAML properties.
 * @type {Object}
 */
var API_KEY_PASS_AS_MAP = {
  header: 'headers',
  query:  'queryParameters'
};

/**
 * Location of the swagger spec on resource listings.
 *
 * @type {String}
 */
var RESOURCE_SPEC_URI = 'https://github.com/wordnik/swagger-spec' +
  '/blob/master/versions/1.2.md#51-resource-listing';

/**
 * Expose the converter.
 */
module.exports = convertResourceListing;

/**
 * Convert a resource listing into a base raml object.
 *
 * @param  {Object} resource
 * @param  {Object} ramlObject
 * @return {Object}
 */
function convertResourceListing (resource, ramlObject) {
  var version = getVersion(resource);

  if (version >= 2) {
    throw new Error('Swagger ' + version.toFixed(1) + ' is not supported');
  }

  if (!resource.apis) {
    throw new Error('Must be a valid resource listing: ' + RESOURCE_SPEC_URI);
  }

  ramlObject = ramlObject || {};

  if (resource.apiVersion) {
    ramlObject.version = resource.apiVersion;
  }

  convertInfo(resource.info, ramlObject);
  convertAuthorizations(resource.authorizations, ramlObject);

  return ramlObject;
}

/**
 * Attach information from the swagger spec to the raml object.
 *
 * @param  {Object} info
 * @param  {Object} ramlObject
 * @return {Object}
 */
function convertInfo (info, ramlObject) {
  if (!info) {
    return ramlObject;
  }

  var documentation = Object.keys(DOCUMENTATION_NAME_MAP)
    .filter(function (key) {
      return info[key];
    })
    .map(function (key) {
      return {
        title:   DOCUMENTATION_NAME_MAP[key],
        content: info[key]
      };
    });

  if (info.title) {
    ramlObject.title = info.title;
  }

  if (documentation.length) {
    ramlObject.documentation = documentation;
  }

  return ramlObject;
}

/**
 * Convert swagger authorizations into raml object format.
 *
 * @param  {Object} authorizations
 * @param  {Object} ramlObject
 * @return {Object}
 */
function convertAuthorizations (authorizations, ramlObject) {
  if (!authorizations) {
    return ramlObject;
  }

  ramlObject.securitySchemes = Object.keys(authorizations)
    .map(function (key) {
      var data = {};

      data[key] = convertAuthorization(authorizations[key]);

      return data;
    });

  return ramlObject;
}

/**
 * Convert a single swagger authorization object into something compatible
 * with raml.
 *
 * @param  {Object} authorization
 * @return {Object}
 */
function convertAuthorization (authorization) {
  if (authorization.type === 'oauth2') {
    return convertOAuth2(authorization);
  }

  if (authorization.type === 'apiKey') {
    return convertApiKey(authorization);
  }

  if (authorization.type === 'basicAuth') {
    return convertBasicAuth(authorization);
  }
}

/**
 * Convert the OAuth 2.0 authorization from swagger into raml object.
 *
 * @param  {Object} authorization
 * @return {Object}
 */
function convertOAuth2 (authorization) {
  var ramlAuth = {
    type: 'OAuth 2.0',
    settings: {
      authorizationGrants: []
    }
  };

  var implicit     = authorization.grantTypes.implicit;
  var authCode     = authorization.grantTypes.authorization_code;
  var description  = [];
  var authSettings = ramlAuth.settings;

  // Map scopes to the RAML object.
  if (authorization.scopes && authorization.scopes.length) {
    var scopeDescriptions = [];

    authSettings.scopes = authorization.scopes.map(function (scope) {
      var name = scope.scope;

      if (scope.description) {
        scopeDescriptions.push('* ' + name + ' - ' + scope.description);
      }

      return name;
    });

    // Push the scope descriptions onto the primary description.
    if (scopeDescriptions.length) {
      description.push('Available scopes: ');
      description.push(scopeDescriptions.join('\n'));
    }
  }

  // Map grant types into the raml object.
  Object.keys(authorization.grantTypes).forEach(function (grantType) {
    authSettings.authorizationGrants.push(GRANT_TYPE_MAP[grantType]);
  });

  if (implicit) {
    if (implicit.loginEndpoint && implicit.loginEndpoint.url) {
      authSettings.authorizationUri = implicit.loginEndpoint.url;
    }

    // Add a manual description if the token name is non-standard.
    if (implicit.tokenName && implicit.tokenName !== 'access_token') {
      description.push(
        'The token grant uses "' + implicit.tokenName + '" as the token name.'
      );
    }
  }

  if (authCode) {
    var tokenEndpoint        = authCode.tokenEndpoint;
    var tokenRequestEndpoint = authCode.tokenRequestEndpoint;
    var clientIdName         = tokenRequestEndpoint.clientIdName;
    var clientSecretName     = tokenRequestEndpoint.clientSecretName;
    var tokenName            = tokenEndpoint.tokenName;

    authSettings.accessTokenUri   = tokenEndpoint.url;
    authSettings.authorizationUri = tokenRequestEndpoint.url;

    if (clientIdName && clientIdName !== 'client_id') {
      description.push(
        'The code grant uses "' + clientIdName + '" as the parameter for ' +
        'passing the client id.'
      );
    }

    if (clientSecretName && clientSecretName !== 'client_secret') {
      description.push(
        'The code grant uses "' + clientSecretName + '" as the parameter ' +
        'for passing the client secret.'
      );
    }

    if (tokenName && tokenName !== 'access_code') {
      description.push(
        'The code grant uses "' + tokenName + '" as the parameter for ' +
        'passing the authorization token.'
      );
    }
  }

  // Add the description to the object if options are available.
  if (description.length) {
    ramlAuth.description = description.join('\n\n');
  }

  return ramlAuth;
}

/**
 * Convert the API key definition in Swagger to a RAML object.
 *
 * @param  {Object} authorization
 * @return {Object}
 */
function convertApiKey (authorization) {
  var ramlAuth = {
    type: 'x-api-key',
    describedBy: {}
  };

  var describedBy = API_KEY_PASS_AS_MAP[authorization.passAs];

  // If the described by property is valid,
  if (describedBy) {
    var description = ramlAuth.describedBy[describedBy] = {};

    // Set the correct parameter on the `describedBy` object.
    description[authorization.keyname] = {
      type:        'string',
      description: 'Used to send a valid API key for authentication.'
    };
  }

  return ramlAuth;
}

/**
 * Convert the basic auth definition in Swagger to a RAML object.
 *
 * @param  {Object} authorization
 * @return {Object}
 */
function convertBasicAuth (authorization) {
  return {
    type: 'Basic Authentication'
  };
}
