'use strict';

var util = require('util');
var chai = require('chai');
var spies = require('chai-spies');
var ContentController = process.requireApi('lib/controllers/ContentController.js');
var ResourceFilter = process.requireApi('lib/storages/ResourceFilter.js');
var httpErrors = process.requireApi('lib/controllers/httpErrors.js');
var assert = chai.assert;

chai.should();
chai.use(spies);

describe('ContentController', function() {
  var ProviderMock;
  var TestContentController;
  var testContentController;
  var expectedEntities;
  var expectedPagination;
  var expectedCount = 42;
  var response;
  var request;
  var superAdminId = '0';
  var anonymousId = '1';
  var manageContentsPermissionId = 'manage-contents';

  // Initiates mocks
  beforeEach(function() {
    ProviderMock = {
      get: function(filter, fields, limit, page, sort, callback) {
        callback(null, expectedEntities, expectedPagination);
      },
      getOne: function(filter, fields, callback) {
        callback(null, expectedEntities[0]);
      },
      update: function(filter, data, callback) {
        callback(null, expectedCount);
      },
      add: function(entities, callback) {
        callback(null, expectedCount);
      },
      remove: chai.spy(function(filter, callback) {
        callback(null, expectedCount);
      }),
      removeField: function(field, filter, callback) {
        callback(null, expectedCount);
      },
      updateOne: chai.spy(function(filter, data, callback) {
        callback(null, 1);
      })
    };

    response = {
      send: function() {}
    };

    request = {
      user: {
        id: '42'
      },
      query: {},
      params: {}
    };

    TestContentController = function() {
      TestContentController.super_.call(this);
    };

    TestContentController.prototype.getProvider = function() {
      return ProviderMock;
    };

    TestContentController.prototype.getSuperAdminId = function() {
      return superAdminId;
    };

    TestContentController.prototype.getAnonymousId = function() {
      return anonymousId;
    };

    TestContentController.prototype.getManageContentsPermissionId = function() {
      return manageContentsPermissionId;
    };

    TestContentController.prototype.isUserManager = function() {
      return false;
    };

    util.inherits(TestContentController, ContentController);
  });

  // Prepare tests using mocks
  beforeEach(function() {
    testContentController = new TestContentController();
    expectedEntities = [];
  });

  describe('getEntitiesAction', function() {

    it('should send the list of entities with pagination', function(done) {
      expectedEntities = [{}];
      expectedPagination = {};

      response = {
        send: function(result) {
          assert.strictEqual(result.entities, expectedEntities, 'Expected a list of entities');
          assert.strictEqual(result.pagination, expectedPagination, 'Expected pagination');
          done();
        }
      };

      testContentController.getEntitiesAction(request, response, function(error) {
        assert.ok(false, 'Unexpected error : ' + error.message);
      });
    });

    it('should send only entities the authenticated user can access', function(done) {
      var expectedGroupIds = ['1', '2'];
      var userPermissions = [];
      expectedEntities = [{}];
      expectedPagination = {};

      expectedGroupIds.forEach(function(groupId) {
        userPermissions.push('get-group-' + groupId);
      });

      response = {
        send: function(result) {
          assert.strictEqual(result.entities, expectedEntities, 'Expected a list of entities');
          assert.strictEqual(result.pagination, expectedPagination, 'Expected pagination');
          done();
        }
      };

      request.user.id = '20';
      request.user.permissions = userPermissions;

      ProviderMock.get = function(filter, fields, limit, page, sort, callback) {
        var userOperation = filter.getComparisonOperation(ResourceFilter.OPERATORS.IN, 'metadata.user');
        var groupOperation = filter.getComparisonOperation(ResourceFilter.OPERATORS.IN, 'metadata.groups');

        assert.include(userOperation.value, request.user.id, 'Expected user id');
        assert.includeMembers(groupOperation.value, expectedGroupIds, 'Expected group id');
        assert.include(userOperation.value, anonymousId, 'Expected anonymous user id');
        callback(null, expectedEntities, expectedPagination);
      };

      testContentController.getEntitiesAction(request, response, function(error) {
        assert.ok(false, 'Unexpected error : ' + error.message);
      });
    });

    it('should be able to include only certain fields from the entities', function(done) {
      var expectedIncludeFields = ['field1', 'field2'];

      ProviderMock.get = function(filter, fields, limit, page, sort, callback) {
        assert.deepEqual(fields.include, expectedIncludeFields, 'Wrong fields');
        done();
      };

      request.query.include = expectedIncludeFields;

      testContentController.getEntitiesAction(request, response, function(error) {
        assert.ok(false, 'Unexpected error : ' + error.message);
      });
    });

    it('should be able to exclude only certain fields from the entities', function(done) {
      var expectedExcludeFields = ['field1', 'field2'];

      ProviderMock.get = function(filter, fields, limit, page, sort, callback) {
        assert.deepEqual(fields.exclude, expectedExcludeFields);
        done();
      };

      request.query.exclude = expectedExcludeFields;

      testContentController.getEntitiesAction(request, response, function(error) {
        assert.ok(false, 'Unexpected error : ' + error.message);
      });
    });

    it('should be able to set the limit number of entities by page', function(done) {
      var expectedLimit = 42;

      ProviderMock.get = function(filter, fields, limit, page, sort, callback) {
        assert.equal(limit, expectedLimit, 'Wrong limit');
        done();
      };

      request.query.limit = expectedLimit;

      testContentController.getEntitiesAction(request, response, function(error) {
        assert.ok(false, 'Unexpected error : ' + error.message);
      });
    });

    it('should be able to set the expected page of entities', function(done) {
      var expectedPage = 42;

      ProviderMock.get = function(filter, fields, limit, page, sort, callback) {
        assert.equal(page, expectedPage, 'Wrong page');
        done();
      };

      request.query.page = expectedPage;

      testContentController.getEntitiesAction(request, response, function(error) {
        assert.ok(false, 'Unexpected error : ' + error.message);
      });
    });

    it('should be able to sort the list of entities by a particular field', function(done) {
      var expectedSortField = 'field';
      var expectedSortOrder = 'asc';

      ProviderMock.get = function(filter, fields, limit, page, sort, callback) {
        assert.equal(sort[expectedSortField], expectedSortOrder, 'Wrong sort');
        done();
      };

      request.query.sortBy = expectedSortField;
      request.query.sortOrder = expectedSortOrder;

      testContentController.getEntitiesAction(request, response, function(error) {
        assert.ok(false, 'Unexpected error : ' + error.message);
      });
    });

    it('should set default sort order to "desc"', function(done) {
      var expectedSortField = 'field';

      ProviderMock.get = function(filter, fields, limit, page, sort, callback) {
        assert.equal(sort[expectedSortField], 'desc', 'Wrong sort');
        done();
      };

      request.query.sortBy = expectedSortField;

      testContentController.getEntitiesAction(request, response, function(error) {
        assert.ok(false, 'Unexpected error : ' + error.message);
      });
    });

    it('should set default limit to 10 if not specified', function(done) {
      ProviderMock.get = function(filter, fields, limit, page, sort, callback) {
        assert.equal(limit, 10, 'Wrong limit');
        done();
      };

      testContentController.getEntitiesAction(request, response, function(error) {
        assert.ok(false, 'Unexpected error : ' + error.message);
      });
    });

    it('should set default page to 0 if not specified', function(done) {
      ProviderMock.get = function(filter, fields, limit, page, sort, callback) {
        assert.equal(page, 0, 'Wrong page');
        done();
      };

      testContentController.getEntitiesAction(request, response, function(error) {
        assert.ok(false, 'Unexpected error : ' + error.message);
      });
    });

    it('should send an HTTP wrong parameters if include is not an Array of Strings', function(done) {
      var wrongValues = [{}];

      response.send = function() {
        assert.ok(false, 'Unexpected response');
      };

      wrongValues.forEach(function(wrongValue) {
        request.query.include = wrongValue;
        testContentController.getEntitiesAction(request, response, function(error) {
          assert.strictEqual(error, httpErrors.GET_ENTITIES_WRONG_PARAMETERS);
        });
      });

      done();
    });

    it('should send an HTTP wrong parameters if exclude is not an Array of Strings', function(done) {
      var wrongValues = [{}];

      response.send = function() {
        assert.ok(false, 'Unexpected response');
      };


      wrongValues.forEach(function(wrongValue) {
        request.query.exclude = wrongValue;
        testContentController.getEntitiesAction(request, response, function(error) {
          assert.strictEqual(error, httpErrors.GET_ENTITIES_WRONG_PARAMETERS);
        });
      });

      done();
    });

    it('should send an HTTP wrong parameters if limit is lesser than equal 0', function(done) {
      var wrongValues = [-42, 0];

      response.send = function() {
        assert.ok(false, 'Unexpected response');
      };

      wrongValues.forEach(function(wrongValue) {
        request.query.limit = wrongValue;
        testContentController.getEntitiesAction(request, response, function(error) {
          assert.strictEqual(error, httpErrors.GET_ENTITIES_WRONG_PARAMETERS);
        });
      });

      done();
    });

    it('should send an HTTP wrong parameters if page is lesser than 0', function(done) {
      var wrongValues = [-42];

      response.send = function() {
        assert.ok(false, 'Unexpected response');
      };

      wrongValues.forEach(function(wrongValue) {
        request.query.page = wrongValue;
        testContentController.getEntitiesAction(request, response, function(error) {
          assert.strictEqual(error, httpErrors.GET_ENTITIES_WRONG_PARAMETERS);
        });
      });

      done();
    });

    it('should send an HTTP wrong parameters if sortOrder is different from "asc" or "desc"', function(done) {
      var wrongValues = ['Something else'];

      response.send = function() {
        assert.ok(false, 'Unexpected response');
      };


      wrongValues.forEach(function(wrongValue) {
        request.query.sortOrder = wrongValue;
        testContentController.getEntitiesAction(request, response, function(error) {
          assert.strictEqual(error, httpErrors.GET_ENTITIES_WRONG_PARAMETERS);
        });
      });

      done();
    });

    it('should send an HTTP server error if an error occured while fetching entities', function(done) {
      ProviderMock.get = function(filter, fields, limit, page, sort, callback) {
        callback(new Error('Error'));
      };

      var response = {
        send: function(entities) {
          assert.ok(false, 'Unexpected response');
        }
      };

      testContentController.getEntitiesAction(request, response, function(error) {
        assert.equal(error, httpErrors.GET_ENTITIES_ERROR, 'Wrong error');
        done();
      });
    });

  });

  describe('getEntityAction', function() {

    it('should send the entity corresponding to the given id', function(done) {
      var expectedId = 'id';
      expectedEntities = [{
        metadata: {
          user: request.user.id
        }
      }];

      response.send = function(result) {
        assert.strictEqual(result.entity, expectedEntities[0], 'Wrong entity');
        done();
      };

      request.params.id = expectedId;

      testContentController.getEntityAction(request, response, function(error, entity) {
        assert.isNull(error, 'Unexpected error');
      });
    });

    it('should send the entity if user is the owner of the entity', function(done) {
      var expectedId = '42';
      expectedEntities = [{
        id: expectedId,
        metadata: {
          user: request.user.id
        }
      }];

      response.send = function(result) {
        assert.strictEqual(result.entity, expectedEntities[0], 'Wrong entity');
        done();
      };

      request.params.id = expectedId;

      testContentController.getEntityAction(request, response, function(error) {
        assert.ok(false, 'Unexpected error');
      });
    });

    it('should send the entity if entity belongs to the anonymous user', function(done) {
      var expectedId = '42';
      expectedEntities = [{
        id: expectedId,
        metadata: {
          user: anonymousId
        }
      }];

      response.send = function(result) {
        assert.strictEqual(result.entity, expectedEntities[0], 'Wrong entity');
        done();
      };

      request.params.id = expectedId;

      testContentController.getEntityAction(request, response, function(error) {
        assert.ok(false, 'Unexpected error');
      });
    });

    it('should send the entity if user has read privilege upon one of the entity groups', function(done) {
      var expectedId = '42';
      var expectedGroup = '43';
      expectedEntities = [{
        id: expectedId,
        metadata: {
          user: 'Something else',
          groups: [expectedGroup]
        }
      }];

      response.send = function(result) {
        assert.strictEqual(result.entity, expectedEntities[0], 'Wrong entity');
        done();
      };

      request.params.id = expectedId;
      request.user.permissions = ['get-group-' + expectedGroup];

      testContentController.getEntityAction(request, response, function(error) {
        assert.ok(false, 'Unexpected error');
      });
    });

    it('should send the entity if user is the super administrator', function(done) {
      var expectedId = '42';
      expectedEntities = [{
        id: expectedId,
        metadata: {
          user: 'Something else'
        }
      }];

      response.send = function(result) {
        assert.strictEqual(result.entity, expectedEntities[0], 'Wrong entity');
        done();
      };

      request.params.id = expectedId;
      request.user.id = superAdminId;

      testContentController.getEntityAction(request, response, function(error) {
        assert.ok(false, 'Unexpected error');
      });
    });

    it('should be able to include only certain fields from the entity', function(done) {
      var expectedInclude = ['field1', 'field2'];

      ProviderMock.getOne = function(filter, fields, callback) {
        assert.deepEqual(fields.include, expectedInclude.concat(['metadata']), 'Wrong include');
        assert.isUndefined(fields.exclude, 'Unexpected exclude');
        done();
      };

      request.params.id = '42';
      request.query.include = expectedInclude;

      testContentController.getEntityAction(request, response, function(error) {
        assert.ok(false, 'Unexpected error : ' + error.message);
      });
    });

    it('should send an HTTP missing parameters if no id specified', function(done) {
      response.send = function() {
        assert.ok(false, 'Unexpected response');
      };

      testContentController.getEntityAction(request, response, function(error) {
        assert.strictEqual(error, httpErrors.GET_ENTITY_MISSING_PARAMETERS, 'Wrong error');
        done();
      });
    });

    it('should send an HTTP wrong parameters if include is not an Array of Strings', function(done) {
      var wrongValues = [{}];

      response.send = function() {
        assert.ok(false, 'Unexpected response');
      };

      request.params.id = '42';

      wrongValues.forEach(function(wrongValue) {
        request.query.include = wrongValue;
        testContentController.getEntityAction(request, response, function(error) {
          assert.strictEqual(error, httpErrors.GET_ENTITY_WRONG_PARAMETERS, 'Wrong error');
        });
      });

      done();
    });

    it('should send an HTTP wrong parameters if exclude is not an Array of Strings', function(done) {
      var wrongValues = [{}];

      response.send = function() {
        assert.ok(false, 'Unexpected response');
      };

      request.params.id = '42';

      wrongValues.forEach(function(wrongValue) {
        request.query.exclude = wrongValue;
        testContentController.getEntityAction(request, response, function(error) {
          assert.strictEqual(error, httpErrors.GET_ENTITY_WRONG_PARAMETERS, 'Wrong error');
        });
      });

      done();
    });

    it('should send an HTTP server error if fetching entity failed', function(done) {
      response.send = function() {
        assert.ok(false, 'Unexpected response');
      };

      ProviderMock.getOne = function(filter, fields, callback) {
        callback(new Error('Error'));
      };

      request.params.id = '42';

      testContentController.getEntityAction(request, response, function(error) {
        assert.strictEqual(error, httpErrors.GET_ENTITY_ERROR, 'Wrong error');
        done();
      });
    });

    it('should send an HTTP not found error if no entity found', function(done) {
      response.send = function() {
        assert.ok(false, 'Unexpected response');
      };

      ProviderMock.getOne = function(filter, fields, callback) {
        callback(null);
      };

      request.params.id = '42';

      testContentController.getEntityAction(request, response, function(error) {
        assert.strictEqual(error, httpErrors.GET_ENTITY_NOT_FOUND, 'Wrong error');
        done();
      });
    });

    it('should send an HTTP forbidden error if user has not enough privileges to get it', function(done) {
      var expectedId = '42';
      expectedEntities = [
        {
          id: expectedId,
          metadata: {
            user: 'Something else'
          }
        }
      ];

      response.send = function(result) {
        assert.ok(false, 'Unexpected response');
      };

      request.params.id = expectedId;

      testContentController.getEntityAction(request, response, function(error) {
        assert.strictEqual(error, httpErrors.GET_ENTITY_FORBIDDEN, 'Wrong error');
        done();
      });
    });

    it('should not be able to exclude "metadata" property from response', function(done) {
      var expectedExclude = ['field1', 'metadata'];

      ProviderMock.getOne = function(filter, fields, callback) {
        assert.notInclude(fields.exclude, 'metadata', 'Unexpected "metadata"');
        done();
      };

      request.params.id = '42';
      request.query.exclude = expectedExclude;

      testContentController.getEntityAction(request, response, function(error) {
        assert.ok(false, 'Unexpected error : ' + error.message);
      });
    });

  });

  describe('updateEntityAction', function() {

    it('should update entity and send operation result', function(done) {
      var expectedData = {
        field1: 'value1',
        field2: 'value2'
      };
      expectedEntities = [
        {
          id: '42',
          metadata: {
            user: request.user.id
          }
        }
      ];

      response.send = function(result) {
        assert.equal(result.total, 1, 'Wrong total');
        done();
      };

      ProviderMock.updateOne = function(filter, data, callback) {
        assert.equal(
          filter.getComparisonOperation(ResourceFilter.OPERATORS.EQUAL, 'id').value,
          expectedEntities[0].id,
          'Wrong id'
        );
        assert.deepEqual(data, expectedData, 'Wrong data');
        callback(null, 1);
      };

      request.params.id = expectedEntities[0].id;
      request.body = expectedData;

      testContentController.updateEntityAction(request, response, function(error) {
        assert.ok(false, 'Unexpected error');
      });
    });

    it('should update entity if user has update privileges on one of the entity group', function(done) {
      var expectedGroup = '42';
      expectedEntities = [
        {
          id: '42',
          metadata: {
            user: 'Something else than actual user id',
            groups: [expectedGroup]
          }
        }
      ];

      response.send = function(result) {
        done();
      };

      ProviderMock.updateOne = function(filter, data, callback) {
        callback(null, 1);
      };

      request.params.id = expectedEntities[0].id;
      request.body = {};
      request.user.permissions = ['update-group-' + expectedGroup];

      testContentController.updateEntityAction(request, response, function(error) {
        assert.ok(false, 'Unexpected error');
      });
    });

    it('should update entity if entity belongs to the anonymous user', function(done) {
      expectedEntities = [
        {
          id: '42',
          metadata: {
            user: anonymousId
          }
        }
      ];

      response.send = function(result) {
        done();
      };

      ProviderMock.updateOne = function(filter, data, callback) {
        callback(null, 1);
      };

      request.params.id = expectedEntities[0].id;
      request.body = {};

      testContentController.updateEntityAction(request, response, function(error) {
        assert.ok(false, 'Unexpected error');
      });
    });

    it('should update entity if user is the super administrator', function(done) {
      expectedEntities = [
        {
          id: '42',
          metadata: {
            user: 'Something else'
          }
        }
      ];

      response.send = function(result) {
        done();
      };

      ProviderMock.updateOne = function(filter, data, callback) {
        callback(null, 1);
      };

      request.params.id = expectedEntities[0].id;
      request.body = {};
      request.user.id = superAdminId;

      testContentController.updateEntityAction(request, response, function(error) {
        assert.ok(false, 'Unexpected error');
      });
    });

    it('should update entity if user is a manager', function(done) {
      expectedEntities = [
        {
          id: '42',
          metadata: {
            user: 'Something else'
          }
        }
      ];

      testContentController.isUserManager = function() {
        return true;
      };

      response.send = function(result) {
        done();
      };

      ProviderMock.updateOne = function(filter, data, callback) {
        callback(null, 1);
      };

      request.params.id = expectedEntities[0].id;
      request.body = {};

      testContentController.updateEntityAction(request, response, function(error) {
        assert.ok(false, 'Unexpected error');
      });
    });

    it('should be able to update entity groups', function(done) {
      var expectedGroupIds = ['42', '43'];
      expectedEntities = [
        {
          id: '42',
          metadata: {
            user: 'Something else'
          }
        }
      ];

      response.send = function(result) {
        done();
      };

      ProviderMock.updateOne = function(filter, data, callback) {
        assert.deepEqual(data['metadata.groups'], expectedGroupIds, 'Wrong groups');
        callback(null, 1);
      };

      request.params.id = expectedEntities[0].id;
      request.body = {
        groups: expectedGroupIds
      };
      request.user.id = superAdminId;

      testContentController.updateEntityAction(request, response, function(error) {
        assert.ok(false, 'Unexpected error');
      });
    });

    it('should be able to update entity owner as the owner', function(done) {
      var expectedOwner = '42';
      expectedEntities = [
        {
          id: '42',
          metadata: {
            user: request.user.id
          }
        }
      ];

      response.send = function(result) {
        done();
      };

      ProviderMock.updateOne = function(filter, data, callback) {
        assert.deepEqual(data['metadata.user'], expectedOwner, 'Wrong owner');
        callback(null, 1);
      };

      request.params.id = expectedEntities[0].id;
      request.body = {
        user: expectedOwner
      };

      testContentController.updateEntityAction(request, response, function(error) {
        assert.ok(false, 'Unexpected error');
      });
    });

    it('should be able to update entity owner as the super administrator', function(done) {
      var expectedOwner = '42';
      expectedEntities = [
        {
          id: '42',
          metadata: {
            user: request.user.id
          }
        }
      ];

      response.send = function(result) {
        done();
      };

      ProviderMock.updateOne = function(filter, data, callback) {
        assert.deepEqual(data['metadata.user'], expectedOwner, 'Wrong owner');
        callback(null, 1);
      };

      request.params.id = expectedEntities[0].id;
      request.body = {
        user: expectedOwner
      };
      request.user.id = superAdminId;

      testContentController.updateEntityAction(request, response, function(error) {
        assert.ok(false, 'Unexpected error');
      });
    });

    it('should be able to update entity owner as a manager', function(done) {
      var expectedOwner = 'Something else';
      expectedEntities = [
        {
          id: '42',
          metadata: {
            user: '43'
          }
        }
      ];

      testContentController.isUserManager = function() {
        return true;
      };

      response.send = function(result) {
        done();
      };

      ProviderMock.updateOne = function(filter, data, callback) {
        assert.deepEqual(data['metadata.user'], expectedOwner, 'Wrong owner');
        callback(null, 1);
      };

      request.params.id = expectedEntities[0].id;
      request.body = {
        user: expectedOwner
      };

      testContentController.updateEntityAction(request, response, function(error) {
        assert.ok(false, 'Unexpected error');
      });
    });

    it('should not be able to update entity owner if not the super administrator nor the owner', function(done) {
      expectedEntities = [
        {
          id: '42',
          metadata: {
            user: anonymousId
          }
        }
      ];

      response.send = function(result) {
        done();
      };

      ProviderMock.updateOne = function(filter, data, callback) {
        assert.isUndefined(data['user'], 'Unexpected user update');
        callback(null, 1);
      };

      request.params.id = expectedEntities[0].id;
      request.body = {
        user: 'Something else'
      };

      testContentController.updateEntityAction(request, response, function(error) {
        assert.ok(false, 'Unexpected error');
      });
    });

    it('should send an HTTP missing error if id parameter is not specified', function(done) {
      var expectedData = {};

      response.send = function() {
        assert.ok(false, 'Unexpected response');
      };

      request.body = expectedData;

      testContentController.updateEntityAction(request, response, function(error) {
        assert.strictEqual(error, httpErrors.UPDATE_ENTITY_MISSING_PARAMETERS, 'Wrong error');
        done();
      });
    });

    it('should send an HTTP missing error if body is not specified', function(done) {
      response.send = function() {
        assert.ok(false, 'Unexpected response');
      };

      request.params.id = '42';

      testContentController.updateEntityAction(request, response, function(error) {
        assert.strictEqual(error, httpErrors.UPDATE_ENTITY_MISSING_PARAMETERS, 'Wrong error');
        done();
      });
    });

    it('should send an HTTP server error if updating entity failed', function(done) {
      expectedEntities = [
        {
          id: '42',
          metadata: {
            user: anonymousId
          }
        }
      ];

      response.send = function() {
        assert.ok(false, 'Unexpected response');
      };

      ProviderMock.updateOne = function(filter, data, callback) {
        callback(new Error('Error'));
      };

      request.params.id = expectedEntities[0].id;
      request.body = {};

      testContentController.updateEntityAction(request, response, function(error) {
        assert.strictEqual(error, httpErrors.UPDATE_ENTITY_ERROR, 'Wrong error');
        done();
      });
    });

    it('should send an HTTP forbidden error if user has not enough privileges to update entity', function(done) {
      expectedEntities = [
        {
          id: '42',
          field1: 'value1',
          metadata: {
            user: 'Something else'
          }
        }
      ];

      response.send = function(result) {
        assert.ok(false, 'Unexpected response');
      };

      request.params.id = expectedEntities[0].id;
      request.body = {
        field1: 'New value'
      };

      testContentController.updateEntityAction(request, response, function(error) {
        ProviderMock.updateOne.should.have.been.called.exactly(0);
        assert.strictEqual(error, httpErrors.UPDATE_ENTITY_FORBIDDEN, 'Wrong error');
        done();
      });
    });

    it('should send an HTTP wrong parameters error if groups is not an array of Strings', function(done) {
      var wrongValues = [{}];

      request.params.id = '42';
      wrongValues.forEach(function(wrongValue) {
        request.body = {
          groups: wrongValue
        };

        testContentController.updateEntityAction(request, response, function(error) {
          assert.strictEqual(error, httpErrors.UPDATE_ENTITY_WRONG_PARAMETERS, 'Wrong error');
          done();
        });
      });
    });

  });

  describe('addEntitiesAction', function() {

    it('should add entities and send operation result', function(done) {
      var expectedEntities = [{}];

      response.send = function(result) {
        assert.strictEqual(result.entities, expectedEntities, 'Wrong entities');
        assert.equal(result.total, expectedEntities.length, 'Wrong status');
        done();
      };

      ProviderMock.add = function(entities, callback) {
        for (var i = 0; i < entities.length; i++)
          assert.strictEqual(entities[i], expectedEntities[i], 'Wrong entities ' + i);

        callback(null, expectedEntities.length, expectedEntities);
      };

      request.body = expectedEntities;

      testContentController.addEntitiesAction(request, response, function(error) {
        assert.ok(false, 'Unexpected error');
      });
    });

    it('should add metadata to the new entities', function(done) {
      var expectedGroups = ['42'];
      var expectedEntities = [{
        groups: expectedGroups
      }];

      response.send = function(result) {
        done();
      };

      ProviderMock.add = function(entities, callback) {
        for (var i = 0; i < entities.length; i++) {
          assert.strictEqual(entities[i].metadata.user, request.user.id, 'Wrong user for entity ' + i);
          assert.deepEqual(entities[i].metadata.groups, expectedGroups, 'Wrong groups for entity ' + i);
        }

        callback(null);
      };

      request.body = expectedEntities;

      testContentController.addEntitiesAction(request, response, function(error) {
        assert.ok(false, 'Unexpected error');
      });
    });

    it('should send an HTTP missing parameters error if body is not specified', function(done) {
      response.send = function(result) {
        assert.ok(false, 'Unexpected response');
      };

      testContentController.addEntitiesAction(request, response, function(error) {
        assert.strictEqual(error, httpErrors.ADD_ENTITIES_MISSING_PARAMETERS, 'Wrong error');
        done();
      });
    });

    it('should send an HTTP wrong parameters error if body is not an array of objects', function(done) {
      var wrongValues = [{}, 'String', true, 42, []];

      response.send = function(result) {
        assert.ok(false, 'Unexpected response');
      };

      wrongValues.forEach(function(wrongValue) {
        request.body = wrongValue;
        testContentController.addEntitiesAction(request, response, function(error) {
          assert.strictEqual(error, httpErrors.ADD_ENTITIES_WRONG_PARAMETERS, 'Wrong error');
        });
      });

      done();
    });

    it('should send an HTTP server error if adding entities failed', function(done) {
      response.send = function(result) {
        assert.ok(false, 'Unexpected response');
      };

      ProviderMock.add = function(entities, callback) {
        callback(new Error('Error'));
      };

      request.body = [{}];

      testContentController.addEntitiesAction(request, response, function(error) {
        assert.strictEqual(error, httpErrors.ADD_ENTITIES_ERROR, 'Wrong error');
        done();
      });

    });

  });

  describe('removeEntitiesAction', function() {

    it('should remove entities and send operation result', function(done) {
      var expectedIds = ['41', '42'];
      expectedIds.forEach(function(expectedId) {
        expectedEntities.push({
          id: expectedId,
          metadata: {
            user: request.user.id
          }
        });
      });

      response.send = function(result) {
        assert.equal(result.total, expectedIds.length, 'Wrong total');
        done();
      };

      ProviderMock.remove = function(filter, callback) {
        assert.equal(filter.operations[0].type, ResourceFilter.OPERATORS.IN, 'Wrong operation type');
        assert.equal(filter.operations[0].field, 'id', 'Wrong operation field');
        assert.deepEqual(filter.operations[0].value, expectedIds, 'Wrong operation value');
        callback(null, expectedIds.length);
      };

      request.params.id = expectedIds.join(',');

      testContentController.removeEntitiesAction(request, response, function(error) {
        assert.ok(false, 'Unexpected error');
      });
    });

    it('should remove entities if user is the super administrator', function(done) {
      var expectedId = '42';
      expectedEntities.push({
        id: expectedId,
        metadata: {
          user: 'Something else'
        }
      });

      response.send = function(result) {
        done();
      };

      ProviderMock.remove = function(filter, callback) {
        assert.include(filter.operations[0].value, expectedId, 'Wrong operation value');
        callback(null, expectedEntities.length);
      };

      request.params.id = expectedId;
      request.user.id = superAdminId;

      testContentController.removeEntitiesAction(request, response, function(error) {
        assert.ok(false, 'Unexpected error');
      });
    });

    it('should remove entities if entities belong to the anonymous user', function(done) {
      var expectedId = '42';
      expectedEntities.push({
        id: expectedId,
        metadata: {
          user: anonymousId
        }
      });

      response.send = function(result) {
        done();
      };

      ProviderMock.remove = function(filter, callback) {
        assert.include(filter.operations[0].value, expectedId, 'Wrong operation value');
        callback(null, expectedEntities.length);
      };

      request.params.id = expectedId;

      testContentController.removeEntitiesAction(request, response, function(error) {
        assert.ok(false, 'Unexpected error');
      });
    });

    it('should remove entities if user has delete privilege on one of entities groups', function(done) {
      var expectedId = '42';
      var expectedGroup = '43';
      expectedEntities.push({
        id: expectedId,
        metadata: {
          user: 'Something else',
          groups: [expectedGroup]
        }
      });

      response.send = function(result) {
        done();
      };

      ProviderMock.remove = function(filter, callback) {
        assert.include(filter.operations[0].value, expectedId, 'Wrong operation value');
        callback(null, expectedEntities.length);
      };

      request.params.id = expectedId;
      request.user.permissions = ['delete-group-' + expectedGroup];

      testContentController.removeEntitiesAction(request, response, function(error) {
        assert.ok(false, 'Unexpected error');
      });
    });

    it('should send an HTTP missing parameters error if id is not specified', function(done) {
      response.send = function(result) {
        assert.ok(false, 'Unexpected error');
      };

      testContentController.removeEntitiesAction(request, response, function(error) {
        assert.strictEqual(error, httpErrors.REMOVE_ENTITIES_MISSING_PARAMETERS, 'Wrong error');
        done();
      });
    });

    it('should send an HTTP server error if removing entities failed', function(done) {
      var expectedId = '42';
      expectedEntities.push({
        id: expectedId,
        metadata: {
          user: request.user.id
        }
      });

      response.send = function(result) {
        assert.ok(false, 'Unexpected error');
      };

      ProviderMock.remove = function(filter, callback) {
        callback(new Error('Error'));
      };

      request.params.id = expectedId;

      testContentController.removeEntitiesAction(request, response, function(error) {
        assert.strictEqual(error, httpErrors.REMOVE_ENTITIES_ERROR, 'Wrong error');
        done();
      });
    });

    it('should send an HTTP server error if removing entities partially failed', function(done) {
      var expectedIds = ['41', '42'];
      expectedIds.forEach(function(expectedId) {
        expectedEntities.push({
          id: expectedId,
          metadata: {
            user: request.user.id
          }
        });
      });

      response.send = function(result) {
        assert.ok(false, 'Unexpected error');
      };

      ProviderMock.remove = function(filter, callback) {
        callback(null, expectedIds.length - 1);
      };

      request.params.id = expectedIds.join(',');

      testContentController.removeEntitiesAction(request, response, function(error) {
        assert.strictEqual(error, httpErrors.REMOVE_ENTITIES_ERROR, 'Wrong error');
        done();
      });
    });

    it('should send an HTTP forbidden if user has not enough privilege to delete entities', function(done) {
      var expectedId = '42';
      expectedEntities.push({
        id: expectedId,
        metadata: {
          user: 'Something else'
        }
      });

      response.send = function(result) {
        assert.ok(false, 'Unexpected response');
      };

      request.params.id = expectedId;

      testContentController.removeEntitiesAction(request, response, function(error) {
        ProviderMock.remove.should.have.been.called.exactly(0);
        assert.strictEqual(error, httpErrors.REMOVE_ENTITIES_FORBIDDEN, 'Wrong error');
        done();
      });
    });

    it('should send an HTTP server error if some entities could not be removed', function(done) {
      var expectedId = '42';
      expectedEntities.push({
        id: expectedId,
        metadata: {
          user: request.user.id
        }
      });

      response.send = function(result) {
        assert.ok(false, 'Unexpected response');
      };

      ProviderMock.remove = function(filter, callback) {
        callback(null, 0);
      };

      request.params.id = expectedId;

      testContentController.removeEntitiesAction(request, response, function(error) {
        assert.strictEqual(error, httpErrors.REMOVE_ENTITIES_ERROR, 'Wrong error');
        done();
      });
    });

  });

  describe('addAccessFilter', function() {

    it('should add user information to a provider filter', function() {
      var filter = new ResourceFilter();
      var expectedId = '42';
      var expectedGroupIds = ['43', '44'];
      var permissions = expectedGroupIds.map(function(groupId) {
        return 'get-group-' + groupId;
      });

      var expectedFilter = testContentController.addAccessFilter(filter, {
        id: expectedId,
        permissions: permissions
      });

      var userOperation = expectedFilter.getComparisonOperation(ResourceFilter.OPERATORS.IN, 'metadata.user');
      var groupsOperation = expectedFilter.getComparisonOperation(ResourceFilter.OPERATORS.IN, 'metadata.groups');

      assert.deepEqual(userOperation.value, [expectedId, anonymousId], 'Wrong user filter');
      assert.deepEqual(groupsOperation.value, expectedGroupIds, 'Wrong groups filter');
    });

    it('should create a new ResourceFilter if none specified', function() {
      var expectedId = '42';

      var expectedFilter = testContentController.addAccessFilter(null, {
        id: expectedId
      });

      var userOperation = expectedFilter.getComparisonOperation(ResourceFilter.OPERATORS.IN, 'metadata.user');

      assert.deepEqual(userOperation.value, [expectedId, anonymousId], 'Wrong user filter');
    });

    it('should return the filter as is if user is not specified', function() {
      var filter = testContentController.addAccessFilter(new ResourceFilter());
      assert.isEmpty(filter.operations, 'Unexpected rules');
    });

    it('should return the filter as is if user is the super administrator', function() {
      var filter = testContentController.addAccessFilter(new ResourceFilter(), {
        id: superAdminId
      });
      assert.isEmpty(filter.operations, 'Unexpected rules');
    });

    it('should return the filter as is if user is a manager', function() {
      testContentController.isUserManager = function() {
        return true;
      };

      var filter = testContentController.addAccessFilter(new ResourceFilter(), {
        id: '42'
      });
      assert.isEmpty(filter.operations, 'Unexpected rules');
    });

  });

  describe('isUserAdmin', function() {

    it('should return true if user is the super administrator', function() {
      assert.ok(testContentController.isUserAdmin({
        id: superAdminId
      }), 'Expected user to be the super administrator');
    });

    it('should return false if user is not the super administrator', function() {
      assert.notOk(testContentController.isUserAdmin({
        id: '42'
      }), 'Expected user not to be the super administrator');
    });

    it('should return false if user is not specified', function() {
      assert.notOk(testContentController.isUserAdmin(), 'Expected user not to be the super administrator');
    });

  });

  describe('isUserAnonymous', function() {

    it('should return true if user is anonymous', function() {
      assert.ok(testContentController.isUserAnonymous({
        id: anonymousId
      }), 'Expected user to be anonymous');
    });

    it('should return false if user is not anonymous', function() {
      assert.notOk(testContentController.isUserAnonymous({
        id: '42'
      }), 'Expected user not to be anonymous');
    });

    it('should return false if user is not specified', function() {
      assert.notOk(testContentController.isUserAnonymous(), 'Expected user not to be anonymous');
    });

  });

  describe('isUserOwner', function() {

    it('should return true if user owns the entity', function() {
      var expectedId = '42';
      assert.ok(testContentController.isUserOwner({
        metadata: {
          user: expectedId
        }
      }, {
        id: expectedId
      }), 'Expected user to be the owner');
    });

    it('should return false if user is not specified', function() {
      assert.notOk(testContentController.isUserOwner({
        metadata: {
          user: '42'
        }
      }), 'Expected user not to be the owner');
    });

    it('should return false if entity has no associated metadata', function() {
      assert.notOk(testContentController.isUserOwner({}, {
        id: '42'
      }), 'Expected user not to be the owner');
    });

  });

  describe('isUserAuthorized', function() {

    it('should return true if the user is the super administrator', function() {
      assert.ok(testContentController.isUserAuthorized({
        id: superAdminId
      }, {
        metadata: {
          user: 'Something else'
        }
      }, ContentController.OPERATIONS.READ), 'Expected user to be authorized');
    });

    it('should return true if the user is a manager', function() {
      testContentController.isUserManager = function() {
        return true;
      };

      assert.ok(testContentController.isUserAuthorized({
        id: '42'
      }, {
        metadata: {
          user: 'Something else'
        }
      }, ContentController.OPERATIONS.READ), 'Expected user to be authorized');
    });

    it('should return true if user is the owner', function() {
      var expectedId = '42';
      assert.ok(testContentController.isUserAuthorized({
        id: expectedId
      }, {
        metadata: {
          user: expectedId
        }
      }, ContentController.OPERATIONS.READ), 'Expected user to be authorized');
    });

    it('should return true if entity belongs to the anonymous user', function() {
      assert.ok(testContentController.isUserAuthorized(null, {
        metadata: {
          user: anonymousId
        }
      }, ContentController.OPERATIONS.READ), 'Expected user to be authorized');
    });

    it('should return true if user has operation privilege on one of the entity groups', function() {
      var expectedGroup = '42';
      var operations = [
        ContentController.OPERATIONS.READ,
        ContentController.OPERATIONS.UPDATE,
        ContentController.OPERATIONS.DELETE
      ];

      operations.forEach(function(operation) {
        assert.ok(testContentController.isUserAuthorized({
          id: '42',
          permissions: [operation + '-group-' + expectedGroup]
        }, {
          metadata: {
            user: 'Something else',
            groups: [expectedGroup]
          }
        }, operation), 'Expected user to be authorized on operation "' + operation + '"');
      });
    });

    it('should return false if user does not have enough privileges', function() {
      var operations = [
        ContentController.OPERATIONS.READ,
        ContentController.OPERATIONS.UPDATE,
        ContentController.OPERATIONS.DELETE
      ];

      operations.forEach(function(operation) {
        assert.notOk(testContentController.isUserAuthorized({
          id: '42'
        }, {
          metadata: {
            user: 'Something else'
          }
        }, operation), 'Expected user to be unauthorized on operation "' + operation + '"');
      });
    });

  });

  describe('removeMetatadaFromFields', function() {

    it('should add "metadata" into include fields', function() {
      var includedFields = ['field1', 'field2'];
      var fields = testContentController.removeMetatadaFromFields({
        include: includedFields
      });

      assert.include(fields.include, 'metadata', 'Expected "metadata" field');
    });

    it('should remove "metadata" from exclude fields', function() {
      var excludedFields = ['field1', 'metadata', 'field2'];
      var fields = testContentController.removeMetatadaFromFields({
        exclude: excludedFields
      });

      assert.notInclude(fields.exclude, 'metadata', 'Unexpected "metadata" field');
    });

    it('should not create include or exclude fields if not specified', function() {
      var fields = testContentController.removeMetatadaFromFields({});

      assert.notProperty(fields, 'include', 'Unexpected "include" property');
      assert.notProperty(fields, 'exclude', 'Unexpected "exclude" property');
    });

  });

});
