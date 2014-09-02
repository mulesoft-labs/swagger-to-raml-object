/* global describe, it, beforeEach */

var expect  = require('chai').expect;
var converter = require('../');

console.log(converter);

describe('resourse listing converter', function () {
  var builder;

  beforeEach(function () {
    convert = converter.resourceListing;
  });

  describe('resources', function () {
    it('should convert the resources', function () {
      var output = convert({
        apis: [{
          description: "Users of the app",
          path: "/user"
        }]
      });

      expect(output).to.deep.equal({
        resources: [{
          description: "Users of the app",
          relativeUri: "/user"
        }]
      });
    });
  });

  describe('swagger version', function () {
    it('should convert the swagger version', function () {
      var output = convert({
        swaggerVersion: '1.2'
      });
      expect(output.documentation[0].title).to.equal('swaggerVersion');
      expect(output.documentation[0].content).to.equal('1.2');
    });
  });

  describe('api version', function () {
    it('should convert the api version', function () {
      var output = convert({
        apiVersion: '1.1'
      });
      expect(output.version).to.equal('1.1');
    });
  });

  describe('swagger info', function () {
  });
});
