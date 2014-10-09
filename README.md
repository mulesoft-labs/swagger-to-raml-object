# Swagger To RAML Object

[![NPM version][npm-image]][npm-url]
[![Build status][travis-image]][travis-url]
[![Test coverage][coveralls-image]][coveralls-url]

Takes a swagger spec and converts it into a RAML JavaScript object, usually for conversion to RAML with the [raml-object-to-raml](https://github.com/mulesoft/raml-object-to-raml) module.

## Installation

```bash
npm install swagger-to-raml-object --save
```

## Usage

Quickly get started converting swagger to RAML in your command line:

```bash
# Make sure node and npm are installed before continuing.

npm install swagger-to-raml-object -g
npm install raml-object-to-raml -g

# Convert a swagger spec into a raml object.
swagger-to-raml-object http://petstore.swagger.wordnik.com/api/api-docs

# Pipe the result of that into the raml object to raml converter.
swagger-to-raml-object http://petstore.swagger.wordnik.com/api/api-docs | raml-object-to-raml

# You can then output the result of that to a file.
swagger-to-raml-object http://petstore.swagger.wordnik.com/api/api-docs | raml-object-to-raml > output.raml
```

### CLI

The CLI accepts a single swagger file to load and will recursively compile the spec into a single RAML object representation before printing the JSON to stdout.

```bash
swagger-to-raml-object resources.json > raml.json
```

### JavaScript

The module exports a single function for converting Swagger specifications. It accepts three arguments, the root resource listing, a file reader function and a callback for when parsing is complete. The callback is called with an error (if something occured) and the resulting RAML object.

```javascript
var converter = require('swagger-to-raml-object');

converter(rootFile, function (filename, done) {
  return fs.readFile(filename, 'utf8', done);
}, function (err, ramlObject) {
  if (err) {
    console.error(err);
  }

  console.log(ramlObject);
  // {
  //   "title": "Example API",
  //   "resources": [{ ... }],
  //   ...
  // }
});

```

## Features and Limitations

* Works with Swagger 1.2 (not 2.0 yet)
* Loads from any resource structure given a file reader function
* Does not parse XML bodies into schemas yet (only JSON and form)
* Does not do any RAML documentation optimisations such as `resourceTypes`, `traits` or global `schemas`
* Currently only does single file output

## License

Apache 2.0

[npm-image]: https://img.shields.io/npm/v/swagger-to-raml-object.svg?style=flat
[npm-url]: https://npmjs.org/package/swagger-to-raml-object
[travis-image]: https://img.shields.io/travis/mulesoft/swagger-to-raml-object.svg?style=flat
[travis-url]: https://travis-ci.org/mulesoft/swagger-to-raml-object
[coveralls-image]: https://img.shields.io/coveralls/mulesoft/swagger-to-raml-object.svg?style=flat
[coveralls-url]: https://coveralls.io/r/mulesoft/swagger-to-raml-object?branch=master
