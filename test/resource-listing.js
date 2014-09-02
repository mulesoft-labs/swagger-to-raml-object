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
});
