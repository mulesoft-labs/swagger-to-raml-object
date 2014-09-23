/* global describe, it, beforeEach */
var expect    = require('chai').expect;
var converter = require('../lib/resource-listing');

describe('resourse listing', function () {
  describe('resources', function () {
    it('should convert root resources', function () {
      var output = converter({
        apis: [{
          path:        '/user',
          description: 'Users of the app'
        }]
      });

      expect(output).to.deep.equal({
        resources: [{
          relativeUri: '/user',
          description: 'Users of the app'
        }]
      });
    });
  });

  describe('security schemes', function () {
    describe('implicit', function () {
      it('should convert implicit authentication', function () {
        var output = converter({
          authorizations: {
            oauth2: {
              type: 'oauth2',
              grantTypes: {
                implicit: {
                  loginEndpoint: {
                    url: 'http://example.com/oauth/dialog'
                  },
                  tokenName: 'access_token'
                }
              }
            }
          }
        });

        expect(output).to.deep.equal({
          securitySchemes: [{
            oauth2: {
              type: 'OAuth 2.0',
              settings: {
                authorizationUri: 'http://example.com/oauth/dialog',
                authorizationGrants: ['token']
              }
            }
          }]
        });
      });
    });

    describe('authorization code', function () {
      it('should convert authorization code authentication', function () {
        var output = converter({
          authorizations: {
            oauth2: {
              type: 'oauth2',
              grantTypes: {
                authorization_code: {
                  tokenRequestEndpoint: {
                    url: 'http://example.com/oauth/requestToken',
                    clientIdName: 'client_id',
                    clientSecretName: 'client_secret'
                  },
                  tokenEndpoint: {
                    url: 'http://example.com/oauth/token',
                    tokenName: 'access_code'
                  }
                }
              }
            }
          }
        });

        expect(output).to.deep.equal({
          securitySchemes: [{
            oauth2: {
              type: 'OAuth 2.0',
              settings: {
                accessTokenUri: 'http://example.com/oauth/token',
                authorizationUri: 'http://example.com/oauth/requestToken',
                authorizationGrants: ['code']
              }
            }
          }]
        });
      });
    });

    describe('basic auth', function () {
      it('should convert basic authentication', function () {
        var output = converter({
          authorizations: {
            basic: {
              type: 'basicAuth'
            }
          }
        });

        expect(output).to.deep.equal({
          securitySchemes: [{
            basic: {
              type: 'Basic Authentication'
            }
          }]
        });
      });
    });

    describe('api key', function () {
      it('should convert the api key type with documentation', function () {
        var output = converter({
          authorizations: {
            apiKey: {
              type: 'apiKey',
              passAs: 'header',
              keyname: 'api_key'
            }
          }
        });

        var apiKeyAuth = output.securitySchemes[0].apiKey;

        expect(output.securitySchemes).to.have.length(1);
        expect(apiKeyAuth).to.be.an('object');
        expect(apiKeyAuth.type).to.equal('x-api-key');
        expect(apiKeyAuth.describedBy).to.have.keys(['headers']);
        expect(apiKeyAuth.describedBy.headers.api_key).to.have.keys(
          ['description', 'type']
        );
      });
    });
  });

  describe('api version', function () {
    it('should set the api version', function () {
      var output = converter({
        apiVersion: '1.1'
      });

      expect(output).to.deep.equal({
        version: '1.1'
      });
    });
  });

  describe('swagger information', function () {
    it('should convert base swagger information', function () {
      var output = converter({
        info: {
          title: 'Example API',
          description: 'This is an example.',
          termsOfServiceUrl: 'http://example.com/terms/',
          contact: 'apiteam@example.com',
          license: 'Apache 2.0',
          licenseUrl: 'http://www.apache.org/licenses/LICENSE-2.0.html'
        }
      });

      expect(output).to.deep.equal({
        title: 'Example API',
        documentation: [
          {
            title: 'Description',
            content: 'This is an example.'
          },
          {
            title: 'Terms of Service URL',
            content: 'http://example.com/terms/'
          },
          {
            title: 'Contact',
            content: 'apiteam@example.com'
          },
          {
            title: 'License',
            content: 'Apache 2.0'
          },
          {
            title: 'License URL',
            content: 'http://www.apache.org/licenses/LICENSE-2.0.html'
          }
        ]
      });
    });
  });
});
