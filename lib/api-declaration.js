var extend = require('extend');

/**
 * Map of valid param types to the valid string.
 *
 * @type {Object}
 */
var PARAM_TYPE_MAP = {
  string:  { type: 'string' },
  number:  { type: 'number' },
  integer: { type: 'integer' },
  boolean: { type: 'boolean' },
  File:    { type: 'file' },
  array:   { repeat: true }
};

/**
 * Map of valid formats to their properties.
 *
 * @type {Object}
 */
var PARAM_FORMAT_MAP = {
  int32: {
    type: 'integer',
    minimum: -2147483648,
    maximum: 2147483647
  },
  int64: {
    type: 'integer',
    minimum: -9223372036854775808,
    maximum: 9223372036854775807
  },
  date: {
    type: 'date'
  },
  'date-time': {
    type: 'date'
  }
};

/**
 * Url-encoded form content type.
 *
 * @type {String}
 */
var URL_ENCODED_MIME = 'application/x-www-form-urlencoded';

/**
 * Content type for multipart form uploads.
 *
 * @type {String}
 */
var MULTI_PART_MIME = 'multipart/form-data';

/**
 * Location of the spec on api declarations.
 *
 * @type {String}
 */
var API_SPEC_URI = 'https://github.com/wordnik/swagger-spec' +
  '/blob/master/versions/1.2.md#52-api-declaration';

/**
 * Expose the converter function.
 */
module.exports = convertApiDeclaration;

/**
 * Convert an api declaration into RAML.
 *
 * @param  {Object} declaration
 * @param  {Object} ramlObject
 * @return {Object}
 */
function convertApiDeclaration (declaration, ramlObject) {
  ramlObject = ramlObject || {};

  // Verify the api declaration is valid.
  if (!declaration.basePath || !declaration.apis) {
    throw new Error('Must be a valid api declaration: ' + API_SPEC_URI);
  }

  // Check if the api version is still the same.
  if (ramlObject.version && declaration.apiVersion !== ramlObject.version) {
    throw new Error(
      'The api version has changed: ' +
      ramlObject.version + ' -> ' + declaration.apiVersion
    );
  }

  // Convert swagger api declaration parameters into raml.
  ramlObject.version = declaration.apiVersion;
  addBasePath(declaration.basePath, ramlObject);
  convertResources(declaration, ramlObject);

  return ramlObject;
}

/**
 * Set the base path from the api declaration on the raml object.
 *
 * @param  {String} basePath
 * @param  {Object} ramlObject
 * @return {Object}
 */
function addBasePath (basePath, ramlObject) {
  // If a base uri has not been set yet, set it here.
  if (!ramlObject.baseUri) {
    ramlObject.baseUri = basePath;

    return ramlObject;
  }

  // If the base path changes for some reason, throw an error. In the future,
  // we may want to refactor the resource tree with new prefixes.
  if (ramlObject.baseUri !== basePath) {
    throw new Error(
      'The base uri has changed: ' + ramlObject.baseUri + ' -> ' + basePath
    );
  }

  return ramlObject;
}

/**
 * Add the resource path to the raml object.
 *
 * @param  {Object} declaration
 * @param  {Object} ramlObject
 * @return {Object}
 */
function convertResources (declaration, ramlObject) {
  var resourcePath = declaration.resourcePath;
  var ramlResource;

  ramlObject.resources = ramlObject.resources || [];

  // Find whether a resource exists with the same relative uri already.
  var hasResourcePath = ramlObject.resources.some(function (resource) {
    if (resource.relativeUri === resourcePath) {
      return (ramlResource = resource);
    }
  });

  // When the resource path has not been set, we'll create it.
  if (!hasResourcePath) {
    ramlObject.resources.push(ramlResource = {
      relativeUri: resourcePath
    });
  }

  // Convert apis to the current raml resource object.
  convertApis(declaration, ramlResource);

  return ramlObject;
}

/**
 * Convert an array of apis into a raml resource.
 *
 * @param  {Object} declaration
 * @param  {Object} ramlResource
 * @return {Object}
 */
function convertApis (declaration, ramlResource) {
  var relativeUri = ramlResource.relativeUri;

  declaration.apis.forEach(function (api) {
    var path     = api.path;
    var resource = ramlResource;

    // I assume this will always occur based on the Swagger specs I've seen.
    if (path.substr(0, relativeUri.length) === relativeUri) {
      path = path.substr(relativeUri.length);
    }

    // If the path still exists, we will create a new nested resource.
    if (path) {
      resource.resources = resource.resources || [];
      resource.resources.push({ relativeUri: path });
      resource = resource.resources[resource.resources.length - 1];
    }

    // Alias the api description onto the new raml resource.
    if (api.description) {
      resource.description = api.description;
    }

    return convertOperations(api.operations, declaration, resource);
  });

  return ramlResource;
}

/**
 * Convert an array of swagger operations for a raml resource.
 *
 * @param  {Object} operations
 * @param  {Object} declaration
 * @param  {Object} ramlResource
 * @return {Object}
 */
function convertOperations (operations, declaration, ramlResource) {
  ramlResource.methods = ramlResource.methods || [];

  operations.forEach(function (operation) {
    if (!operation.method) {
      throw new Error('Expected the operation to have a method defined');
    }

    // Initialise the method object. This assumes the same method name has not
    // already been used.
    var method = {
      method:      operation.method,
      displayName: operation.nickname,
      description: operation.notes || operation.summary || ''
    };

    if (operation.deprecated === 'true' || operation.deprecated === true) {
      if (method.description) {
        method.description += '\n\n';
      }

      method.description += 'This method has been deprecated.';
    }

    convertParameters(operation, declaration, method, ramlResource);
    convertResponseMessages(operation, declaration, method);

    ramlResource.methods.push(method);
  });

  return ramlResource;
}

/**
 * Convert response messages into the raml object.
 *
 * @param  {Object} operation
 * @param  {Object} declaration
 * @param  {Object} method
 * @return {Object}
 */
function convertResponseMessages (operation, declaration, method) {
  if (!operation.responseMessages || !operation.responseMessages.length) {
    return method;
  }

  // Initialise the responses object.
  var responses = method.responses = method.responses || {};
  var produces  = operation.produces || declaration.produces || [];

  // Alias all response messages.
  operation.responseMessages.forEach(function (response) {
    responses[response.code] = { description: response.message };

    // Adds the produces mime types to the reponses object.
    if (produces.length) {
      responses[response.code].body = {};

      produces.forEach(function (mime) {
        responses[response.code].body[mime] = null;
      });
    }
  });

  return method;
}

/**
 * Convert swagger operation parameters for a raml method.
 *
 * @param  {Array}  operation
 * @param  {Object} declaration
 * @param  {Object} ramlMethod
 * @param  {Object} ramlResource
 * @return {Object}
 */
function convertParameters (operation, declaration, ramlMethod, ramlResource) {
  var consumes   = operation.consumes || declaration.consumes || [];
  var parameters = groupParameters(operation.parameters);

  // Path parameters are more applicable to the resource than the method.
  if (parameters.path) {
    ramlResource.uriParameters = convertParametersToRaml(
      parameters.path, declaration
    );
  }

  // Add query parameters to the current method.
  if (parameters.query) {
    ramlMethod.queryParameters = convertParametersToRaml(
      parameters.query, declaration
    );
  }

  // Add headers to the current method.
  if (parameters.header) {
    ramlMethod.headers = convertParametersToRaml(
      parameters.header, declaration
    );
  }

  // Convert the body parameters before attempting the form.
  if (parameters.body) {
    convertBodyParameters(parameters.body, consumes, declaration, ramlMethod);
  }

  // Convert the form parameter into something that works better
  if (parameters.form) {
    convertFormParameters(parameters.form, consumes, declaration, ramlMethod);
  }

  return ramlMethod;
}

/**
 * Map of conversion mime types to functions.
 *
 * @type {Object}
 */
var CONVERT_PARAMS_TO_SCHEMA = {
  'application/xml':  null, // convertParametersToXmlSchema
  'application/json': null  // convertParametersToJsonSchema
};

/**
 * Convert body parameters inline into raml schemas.
 *
 * @param  {Array}  params
 * @param  {Array}  consumes
 * @param  {Object} declaration
 * @param  {Object} ramlMethod
 * @return {Object}
 */
function convertBodyParameters (params, consumes, declaration, ramlMethod) {
  ramlMethod.body = ramlMethod.body || {};

  // Iterate over the consumes object and convert known types.
  consumes.forEach(function (mime) {
    if (CONVERT_PARAMS_TO_SCHEMA[mime]) {
      return ramlMethod.body[mime] = {
        schema: CONVERT_PARAMS_TO_SCHEMA[mime](params, declaration)
      };
    }

    ramlMethod.body[mime] = null;
  });

  return ramlMethod;
}

/**
 * Convert form parameters inline and mutate the raml method.
 *
 * @param  {Array}  params
 * @param  {Array}  consumes
 * @param  {Object} declaration
 * @param  {Object} ramlMethod
 * @return {Object}
 */
function convertFormParameters (params, consumes, declaration, ramlMethod) {
  if (!params || !params.length) {
    return ramlMethod;
  }

  var multiPart  = consumes.indexOf(MULTI_PART_MIME) > -1;
  var urlEncoded = consumes.indexOf(URL_ENCODED_MIME) > -1;
  var ramlParams = convertParametersToRaml(params, declaration);

  // Enforce multipart if the parameters contain a file type.
  if (!multiPart) {
    multiPart = params.some(function (param) {
      return param.type === 'File';
    });
  }

  // Initialise the body to an object, if it hasn't already been.
  ramlMethod.body = ramlMethod.body || {};

  // Alias the object based on the consumes type.
  if (multiPart && urlEncoded) {
    ramlMethod.body[MULTI_PART_MIME].formParameters  = ramlParams;
    ramlMethod.body[URL_ENCODED_MIME].formParameters = ramlParams;
  } else if (multiPart) {
    ramlMethod.body[MULTI_PART_MIME] = ramlParams;
  } else {
    ramlMethod.body[URL_ENCODED_MIME] = ramlParams;
  }

  return ramlMethod;
}

/**
 * Group parameters by types.
 *
 * @param  {Array}  parameters
 * @return {Object}
 */
function groupParameters (parameters) {
  var groups = {};

  Object.keys(parameters).forEach(function (key) {
    var parameter = parameters[key];
    var type      = parameter.paramType;
    var group     = groups[type] = groups[type] || [];

    group.push(parameter);
  });

  return groups;
}

/**
 * Convert an array of swagger parameters to the resource path.
 *
 * @param  {Array}  params
 * @param  {Object} declaration
 * @return {Object}
 */
function convertParametersToRaml (params, declaration) {
  var ramlParams = {};

  params.forEach(function (param) {
    ramlParams[param.name] = convertParameter(param, declaration);
  });

  return ramlParams;
}

/**
 * Convert a single parameter to raml style.
 *
 * @param  {Object} param
 * @param  {Object} declaration
 * @return {Object}
 */
function convertParameter (param, declaration) {
  var ramlParameter = {};

  // Extend the parameter information based on the type.
  if (param.type && PARAM_TYPE_MAP[param.type]) {
    extend(ramlParameter, PARAM_TYPE_MAP[param.type]);
  } else {
    // TODO: Handle models with `.type` or `.$ref`.
  }

  // Extend the parameter with defaults set by the format.
  if (PARAM_FORMAT_MAP[param.format]) {
    extend(ramlParameter, PARAM_FORMAT_MAP[param.format]);
  }

  if (typeof param.description === 'string') {
    ramlParameter.description = param.description;
  }

  if (typeof param.required === 'boolean') {
    ramlParameter.required = param.required;
  }

  if (param.defaultValue) {
    ramlParameter.default = param.defaultValue;
  }

  if (Array.isArray(param.enum)) {
    ramlParameter.enum = param.enum;
  }

  if (typeof param.minimum === 'number') {
    ramlParameter.minimum = param.minimum;
  }

  if (typeof param.maximum === 'number') {
    ramlParameter.maximum = param.maximum;
  }

  return ramlParameter;
}
