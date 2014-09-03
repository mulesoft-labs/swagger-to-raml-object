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

  describe('security', function() {
    describe('add implicit grant type', function () {
      it('should add the login url', function () {
        var output = convert({
          "authorizations": {
            "oauth2": {
              "type": "oauth2",
              "grantTypes": {
                "implicit": {
                  "loginEndpoint": {
                    "url": "http://example.com/oauth/dialog"
                  },
                  "tokenName": "access_token"
                }
              }
            }
          }
        });
        settings = output.securitySchemes[0].oauth2.settings;

        expect(settings.authorizationUri).to.equal('http://example.com/oauth/dialog');
        expect(settings.documentation[0]).to.deep.equal(
          {implicit_grant_token_name: 'access_token'});
      });
    });

    describe('add authorization code', function () {
      beforeEach(function () {
        output = convert({
          "authorizations": {
            "oauth2": {
              "type": "oauth2",
              "grantTypes": {
                "authorization_code": {
                  "tokenRequestEndpoint": {
                    "url": "http://example.com/oauth/requestToken",
                    "clientIdName": "client_id",
                    "clientSecretName": "client_secret"
                  },
                  "tokenEndpoint": {
                    "url": "http://example.com/oauth/token",
                    "tokenName": "access_code"
                  }
                }
              }
            }
          }
        });
        settings = output.securitySchemes[0].oauth2.settings;
      });

      it('should add the token request endpoint URL', function() {
        expect(settings.authorizationUri).to.equal('http://example.com/oauth/requestToken');
      });

      it('should add the token endpoint URL', function() {
        expect(settings.accessTokenUri).to.equal('http://example.com/oauth/token');
      });

      it('should place optional Swagger fields into documentation', function() {
        expect(settings.documentation[0].authcode_client_id_name).to.equal('client_id');
        expect(settings.documentation[1].authcode_client_secret_name).to.equal('client_secret');
        expect(settings.documentation[2].authcode_token_name).to.equal('access_code');
      });
    });

    describe('add basic authentication', function() {
      it('should add the login url', function () {
        var output = convert({
          "authorizations": {
            "basic": {
              "type": "basicAuth"
            }
          }
        });
        expect(output.securitySchemes[0].basic.type).to.equal('Basic Authentication');
      });
    });

    describe('add apikey authentication', function() {
      it('should set the type to x-ApiKey', function () {
        var output = convert({
          "authorizations": {
            "key": { "type": "apiKey", "passAs": "header"}
          }
        });
        expect(output.securitySchemes[0].apiKey.type).to.equal('x-ApiKey');
      });

      it('should use the value of passAs as the keyname inside describedBy', function() {
        var output = convert({
          "authorizations": {
            "key": { "type": "apiKey", "passAs": "query"}
          }
        });
        expect(output.securitySchemes[0].apiKey.describedBy).to.have.keys(['queryParameters']);
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
    it('should convert all parts of the swagger info object', function () {
      var output = convert({
        info: {
          'title':'Example App',
          'description':'This is a sample server.',
          'termsOfServiceUrl':'http://example.com/terms/',
          'contact':'apiteam@example.com',
          'license':'Apache 2.0',
          'licenseUrl':'http://www.apache.org/licenses/LICENSE-2.0.html'
        }
      });
      expect(output.documentation).to.deep.equal([
        { title: 'description', content: 'This is a sample server.' },
        { title: 'termsOfServiceUrl', content: 'http://example.com/terms/' },
        { title: 'contact', content: 'apiteam@example.com' },
        { title: 'license', content: 'Apache 2.0' },
        { title: 'licenseUrl',
         content: 'http://www.apache.org/licenses/LICENSE-2.0.html' }
      ]);
      expect(output.title).to.equal('Example App');
    });
  });
});
