var parse                  = require('./lib/parse');
var isResourceListing      = require('./lib/utils/is-resource-listing');
var convertApiDeclaration  = require('./lib/api-declaration');
var convertResourceListing = require('./lib/resource-listing');

/**
 * Expose the swagger to raml object converter module.
 */
module.exports = swaggerToRamlObject;

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
    var ramlObject = convertResourceListing(result);
    var resources  = result.apis.map(function (api) {
      return filename + api.path;
    });

    return async(resources, read, wrapContents(function (results) {
      // Iterate over the resulting contents and convert into a single object.
      results.forEach(function (result) {
        convertApiDeclaration(result, ramlObject);
      });

      return done(null, ramlObject);
    }, done));
  }, done));
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
        return done(err);
      }

      count++
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
