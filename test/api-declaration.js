/* global describe, it, beforeEach */
var expect    = require('chai').expect;
var converter = require('../lib/api-declaration');

describe('api declaration', function () {
  describe('base settings', function () {
    it('should convert basic settings', function () {
      var output = converter({
        basePath: 'http://example.com',
        apis: [],
        apiVersion: '1.2'
      });

      expect(output).to.deep.equal({
        baseUri: 'http://example.com',
        resources: [],
        version: '1.2'
      });
    });
  });

  describe('apis', function () {
    it('should create under the resource path', function () {
      var output = converter({
        basePath: 'http://example.com',
        apiVersion: '1.0.0',
        swaggerVersion: '1.2',
        resourcePath: '/user',
        produces: ['application/json'],
        consumes: ['application/json'],
        apis: [{
          path: '/user/{username}',
          operations: [{
            method: 'PUT',
            summary: 'Updated user',
            notes: 'This can only be done by the logged in user.',
            type: 'void',
            nickname: 'updateUser',
            authorizations: {
              oauth2: [{
                scope: 'test:anything',
                description: 'anything'
              }]
            },
            parameters: [{
              name: 'username',
              description: 'name that need to be deleted',
              required: true,
              type: 'string',
              paramType: 'path',
              allowMultiple: false
            }, {
              name: 'body',
              description: 'Updated user object',
              required: true,
              type: 'User',
              paramType: 'body',
              allowMultiple: false
            }],
            responseMessages: [{
              code: 400,
              message: 'Invalid username supplied'
            }, {
              code: 404,
              message: 'User not found'
            }]
          }, {
            method: 'DELETE',
            summary: 'Delete user',
            notes: 'This can only be done by the logged in user.',
            type: 'void',
            nickname: 'deleteUser',
            authorizations: {
              oauth2: [{
                scope: 'test:anything',
                description: 'anything'
              }]
            },
            parameters: [{
              name: 'username',
              description: 'The name that needs to be deleted',
              required: true,
              type: 'string',
              paramType: 'path',
              allowMultiple: false
            }],
            responseMessages: [{
              code: 400,
              message: 'Invalid username supplied'
            }, {
              code: 404,
              message: 'User not found'
            }]
          }, {
            method: 'GET',
            summary: 'Get user by user name',
            notes: '',
            type: 'User',
            nickname: 'getUserByName',
            authorizations: {},
            parameters: [{
              name: 'username',
              description: 'The name that needs to be fetched. Use user1 for testing.',
              required: true,
              type: 'string',
              paramType: 'path',
              allowMultiple: false
            }],
            responseMessages: [{
              code: 400,
              message: 'Invalid username supplied'
            }, {
              code: 404,
              message: 'User not found'
            }]
          }]
        }, {
          path: '/user',
          operations: [{
            method: 'POST',
            summary: 'Create user',
            notes: 'This can only be done by the logged in user.',
            type: 'void',
            nickname: 'createUser',
            authorizations: {
              oauth2: [{
                scope: 'test:anything',
                description: 'anything'
              }]
            },
            parameters: [{
              name: 'body',
              description: 'Created user object',
              required: true,
              type: 'User',
              paramType: 'body',
              allowMultiple: false
            }]
          }]
        }],
        models: {
          User: {
            id: 'User',
            properties: {
              id: {
                type: 'integer',
                format: 'int64'
              },
              firstName: {
                type: 'string'
              },
              username: {
                type: 'string'
              },
              lastName: {
                type: 'string'
              },
              email: {
                type: 'string'
              },
              password: {
                type: 'string'
              },
              phone: {
                type: 'string'
              },
              userStatus: {
                type: 'integer',
                format: 'int32',
                description: 'User Status',
                enum: [
                  '1-registered',
                  '2-active',
                  '3-closed'
                ]
              }
            }
          }
        }
      });

      expect(output).to.deep.equal({
        version: '1.0.0',
        baseUri: 'http://example.com',
        resources: [
          {
            relativeUri: '/user',
            methods: [
              {
                method: 'POST',
                displayName: 'createUser',
                description: 'This can only be done by the logged in user.',
                body: {
                  'application/json': {
                    schema: '{\n  "$schema": "http://json-schema.org/draft-04/schema#",\n  "properties": {\n    "id": {\n      "type": "integer"\n    },\n    "firstName": {\n      "type": "string"\n    },\n    "username": {\n      "type": "string"\n    },\n    "lastName": {\n      "type": "string"\n    },\n    "email": {\n      "type": "string"\n    },\n    "password": {\n      "type": "string"\n    },\n    "phone": {\n      "type": "string"\n    },\n    "userStatus": {\n      "type": "integer",\n      "description": "User Status",\n      "enum": [\n        "1-registered",\n        "2-active",\n        "3-closed"\n      ]\n    }\n  },\n  "description": "Created user object",\n  "required": true\n}'
                  }
                }
              }
            ],
            resources: [
              {
                relativeUri: '/{username}',
                methods: [
                  {
                    method: 'PUT',
                    displayName: 'updateUser',
                    description: 'This can only be done by the logged in user.',
                    body: {
                      'application/json': {
                        schema: '{\n  "$schema": "http://json-schema.org/draft-04/schema#",\n  "properties": {\n    "id": {\n      "type": "integer"\n    },\n    "firstName": {\n      "type": "string"\n    },\n    "username": {\n      "type": "string"\n    },\n    "lastName": {\n      "type": "string"\n    },\n    "email": {\n      "type": "string"\n    },\n    "password": {\n      "type": "string"\n    },\n    "phone": {\n      "type": "string"\n    },\n    "userStatus": {\n      "type": "integer",\n      "description": "User Status",\n      "enum": [\n        "1-registered",\n        "2-active",\n        "3-closed"\n      ]\n    }\n  },\n  "description": "Updated user object",\n  "required": true\n}'
                      }
                    },
                    responses: {
                      400: {
                        description: 'Invalid username supplied',
                        body: {
                          'application/json': null
                        }
                      },
                      404: {
                        description: 'User not found',
                        body: {
                          'application/json': null
                        }
                      }
                    }
                  },
                  {
                    method: 'DELETE',
                    displayName: 'deleteUser',
                    description: 'This can only be done by the logged in user.',
                    responses: {
                      400: {
                        description: 'Invalid username supplied',
                        body: {
                          'application/json': null
                        }
                      },
                      404: {
                        description: 'User not found',
                        body: {
                          'application/json': null
                        }
                      }
                    }
                  },
                  {
                    method: 'GET',
                    displayName: 'getUserByName',
                    description: 'Get user by user name',
                    responses: {
                      400: {
                        description: 'Invalid username supplied',
                        body: {
                          'application/json': null
                        }
                      },
                      404: {
                        description: 'User not found',
                        body: {
                          'application/json': null
                        }
                      }
                    }
                  }
                ],
                uriParameters: {
                  username: {
                    type: 'string',
                    description: 'The name that needs to be fetched. Use user1 for testing.',
                    required: true
                  }
                }
              }
            ]
          }
        ]
      });
    });
  });

  describe('validation', function () {
    it('should throw missing base path', function () {
      expect(function () {
        converter({})
      }).to.throw(Error, /valid/);
    });

    it('should throw an error if the version has changed', function () {
      expect(function () {
        converter({
          apis: [],
          basePath: 'http://example.com',
          apiVersion: 1.2
        }, {
          version: 1.1
        });
      }).to.throw(Error, /version/);
    });

    it('should throw an error if the base path changes', function () {
      expect(function () {
        converter({
          apis: [],
          basePath: 'http://example.com'
        }, {
          baseUri: 'http://original.com'
        });
      }).to.throw(Error, /base uri has changed/);
    });
  });
});
