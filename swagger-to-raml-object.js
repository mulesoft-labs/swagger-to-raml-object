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
  return filereader(filename, wrapContents(function (content) {
    if (!isResourceListing(content)) {
      return done(null, convertApiDeclaration(content));
    }

    // Parse the initial resource listing to start reading more resources.
    var ramlObject = convertResourceListing(content);
    var resources  = content.apis.map(function (api) {
      return filename + api.path;
    });

    return async(resources, filereader, wrapContents(function (contents) {
      // Iterate over the resulting contents and convert into a single object.
      contents.forEach(function (content) {
        convertApiDeclaration(content, ramlObject);
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
 * Wrap the response from a file reader with parse ability.
 *
 * @param  {Function} resolve
 * @param  {Function} reject
 * @return {Function}
 */
function wrapContents (resolve, reject) {
  return function (err, contents) {
    if (err) {
      return reject(err);
    }

    try {
      if (Array.isArray(contents)) {
        return resolve(contents.map(parse));
      }

      return resolve(parse(contents));
    } catch (e) {
      return reject(e);
    }
  };
}
