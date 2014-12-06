#!/usr/bin/env node

var fs        = require('fs');
var path      = require('path');
var request   = require('request');
var converter = require('../');
var filename  = process.argv[2];

if (!filename) {
  console.error();
  console.error('Usage: swagger-to-raml-object api-docs');
  console.error();
  process.exit(1);
}

if (!/^\w+\:\/\//.test(filename) && fs.statSync(filename).isDirectory()) {
  converter.files(getFiles(filename), filereader, complete)
} else {
  converter(filename, filereader, complete);
}

/**
 * Synchronous and recursively get all files in a directory.
 *
 * @param  {String} dirname
 * @return {Object}
 */
function getFiles (dirname) {
  var list    = [];
  var visited = [];

  (function readdir (dirname) {
    var files = fs.readdirSync(dirname);

    files.forEach(function (file) {
      var filename = path.join(dirname, file);

      if (fs.statSync(filename).isDirectory()) {
        if (visited.indexOf(filename) > -1) {
          throw new Error('Stuck in recursive loop');
        }

        visited.push(filename);
        return readdir(filename);
      }

      list.push(filename);
    });
  })(dirname);

  return list;
}

/**
 * Read from the filesystem and remote URL.
 *
 * @param {String}   filename
 * @param {Function} done
 */
function filereader (filename, done) {
  if (/https?:\/\//i.test(filename)) {
    return request(filename, {
      rejectUnauthorized: false
    }, function (err, res, body) {
      return done(err, body);
    });
  }

  return fs.readFile(filename, 'utf8', done);
}

/**
 * Callback to run when Swagger has been generated.
 *
 * @param {Error}  err
 * @param {Object} ramlObject
 */
function complete (err, ramlObject) {
  if (err) {
    console.error(err.stack);
    return process.exit(1);
  }

  console.log(JSON.stringify(ramlObject));
}
