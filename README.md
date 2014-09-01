# Swagger To RAML Object

[![NPM version][npm-image]][npm-url]
[![Build status][travis-image]][travis-url]
[![Test coverage][coveralls-image]][coveralls-url]

Takes a swagger spec and converts it into a RAML JavaScript object, usually for conversion to RAML with the `raml-object-to-raml` module.

## Installation

```
git clone https://github.com/mulesoft/swagger-to-raml-object.git
cd swagger-to-raml-object
npm install
npm install -g . # package not yet hosted on NPM
```

## Usage

```javascript
swagger-to-raml-object resourceListing.json apiDeclaration1.json apiDeclaration2.json...
```
Note: API Declaration file conversion isn't implemented in this branch, but two command line arguments are still required.

## License

Apache 2.0

[npm-image]: https://img.shields.io/npm/v/swagger-to-raml-object.svg?style=flat
[npm-url]: https://npmjs.org/package/swagger-to-raml-object
[travis-image]: https://img.shields.io/travis/mulesoft/swagger-to-raml-object.svg?style=flat
[travis-url]: https://travis-ci.org/mulesoft/swagger-to-raml-object
[coveralls-image]: https://img.shields.io/coveralls/mulesoft/swagger-to-raml-object.svg?style=flat
[coveralls-url]: https://coveralls.io/r/mulesoft/swagger-to-raml-object?branch=master
