var parse                  = require('./lib/parse');
var resolve                = require('./lib/utils/resolve');
var isResourceListing      = require('./lib/utils/is-resource-listing');
var convertApiDeclaration  = require('./lib/api-declaration');
var convertResourceListing = require('./lib/resource-listing');

/**
 * Expose the swagger to raml object converter module.
 */
module.exports = swaggerToRamlObject;
module.exports.files = swaggerFilesToRamlObject;

/**
 * Convert swagger to a raml object by loading the file.
 *
 * @param {String}   filename
 * @param {Function} filereader
 * @param {Function} done
 */
function swaggerToRamlObject (filename, filereader, done) {
  var read = wrapFileReader(filereader);

  return read(filename, wrapContents(function (result) {
    if (!isResourceListing(result)) {
      return done(null, convertApiDeclaration(result));
    }

    // Parse the initial resource listing to start reading more resources.
    var resources  = extractResources(result, filename);
    var ramlObject = convertResourceListing(result);

    function success (results) {
      results.forEach(function (contents) {
        convertApiDeclaration(contents, ramlObject);
      });

      return done(null, ramlObject);
    }

    return async(resources, read, wrapContents(success, done));
  }, done));
}

/**
 * Generate RAML from an array of Swagger files.
 *
 * @param {Array}    files
 * @param {Function} filereader
 * @param {Function} done
 */
function swaggerFilesToRamlObject (files, filereader, done) {
  return async(files, filereader, wrapContents(function (results) {
    var fileMap = {};

    // Parse all the files and ignore non-parsable files (non-Swagger, etc.)
    results.forEach(function (contents, index) {
      var filename = files[index];
      var result;

      try {
        result = parse(contents);
      } catch (e) {
        return;
      }

      fileMap[filename] = result;
    });

    var keys = Object.keys(fileMap);
    var rootFileName = keys[0];

    if (keys.length > 1) {
      rootFileName = findResourceListing(fileMap);

      if (!rootFileName) {
        throw new TypeError('Unable to determine entry file (Swagger resource listing)');
      }
    }

    var resourceListing = fileMap[rootFileName];

    if (!isResourceListing(resourceListing)) {
      return done(null, convertApiDeclaration(resourceListing));
    }

    var read       = wrapFileReader(filereader);
    var resources  = extractResources(resourceListing, rootFileName);
    var ramlObject = convertResourceListing(resourceListing);

    function readfile (filename, done) {
      if (fileMap.hasOwnProperty(filename)) {
        return done(null, fileMap[filename]);
      }

      return read(filename, done);
    }

    function success (results) {
      results.forEach(function (contents) {
        convertApiDeclaration(contents, ramlObject);
      });

      return done(null, ramlObject);
    }

    return async(resources, readfile, wrapContents(success, done));
  }, done));
}

/**
 * Extract API resources from a resource listing.
 *
 * @param  {Object} resourceListing
 * @param  {String} filename
 * @return {Array}
 */
function extractResources (resourceListing, filename) {
  return resourceListing.apis.map(function (api) {
    return resolve(filename, api.path);
  });
}

/**
 * Find a valid resource listing file out of an object.
 *
 * @param  {Object} files
 * @return {String}
 */
function findResourceListing (files) {
  var resourceListings = Object.keys(files).filter(function (key) {
    return isResourceListing(files[key]);
  });

  if (resourceListings.length > 1) {
    throw new Error('Multiple resource listings found');
  }

  return resourceListings[0];
}

/**
 * Run a function on an array of items asynchonrously.
 *
 * @param {Array}    items
 * @param {Function} fn
 * @param {Function} done
 */
function async (items, fn, done) {
  var count   = 0;
  var length  = items.length;
  var results = [];
  var errored = false;

  items.forEach(function (item, index) {
    // Call the async function with the item and callback.
    fn(item, function (err, result) {
      if (errored) {
        return;
      }

      if (err) {
        errored = true;

        return done(err);
      }

      count++;
      results[index] = result;

      if (count === length) {
        return done(null, results);
      }
    });
  });
}

/**
 * Wrap the file reader functionality with parsing.
 *
 * @param  {Function} fn
 * @return {Function}
 */
function wrapFileReader (fn) {
  return function (filename, done) {
    return fn(filename, function (err, result) {
      if (err) {
        return done(err);
      }

      try {
        return done(null, parse(result));
      } catch (e) {
        return done(e);
      }
    });
  }
}

/**
 * Wrap the response from a file reader with parse ability.
 *
 * @param  {Function} resolve
 * @param  {Function} reject
 * @return {Function}
 */
function wrapContents (resolve, reject) {
  return function (err, result) {
    if (err) {
      return reject(err);
    }

    try {
      return resolve(result);
    } catch (e) {
      return reject(e);
    }
  };
}
