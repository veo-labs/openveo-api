'use strict';

var util = require('util');
var assert = require('chai').assert;
var EntityController = process.requireApi('lib/controllers/EntityController.js');
var ResourceFilter = process.requireApi('lib/storages/ResourceFilter.js');
var httpErrors = process.requireApi('lib/controllers/httpErrors.js');

describe('EntityController', function() {
  var ProviderMock;
  var TestEntityController;
  var testEntityController;
  var expectedEntities;
  var expectedPagination;
  var expectedCount = 42;
  var response;
  var request;

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
      remove: function(filter, callback) {
        callback(null, expectedCount);
      },
      removeField: function(field, filter, callback) {
        callback(null, expectedCount);
      }
    };

    response = {
      send: function() {}
    };

    request = {
      query: {},
      params: {}
    };

    TestEntityController = function() {
      TestEntityController.super_.call(this);
    };

    TestEntityController.prototype.getProvider = function() {
      return ProviderMock;
    };

    util.inherits(TestEntityController, EntityController);
  });

  // Initiates tests
  beforeEach(function() {
    testEntityController = new TestEntityController();
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

      testEntityController.getEntitiesAction(request, response, function(error) {
        assert.ok(false, 'Unexpected error : ' + error.message);
      });
    });

    it('should be able to include only certain fields from the list of entities', function(done) {
      var expectedInclude = ['field1', 'field2'];

      ProviderMock.get = function(filter, fields, limit, page, sort, callback) {
        assert.deepEqual(fields.include, expectedInclude, 'Wrong include');
        assert.isUndefined(fields.exclude, 'Unexpected exclude');
        done();
      };

      request.query.include = expectedInclude;

      testEntityController.getEntitiesAction(request, response, function(error) {
        assert.ok(false, 'Unexpected error : ' + error.message);
      });
    });

    it('should be able to exclude only certain fields from the list of entities', function(done) {
      var expectedExclude = ['field1', 'field2'];

      ProviderMock.get = function(filter, fields, limit, page, sort, callback) {
        assert.deepEqual(fields.exclude, expectedExclude, 'Wrong exclude');
        assert.isUndefined(fields.include, 'Unexpected include');
        done();
      };

      request.query.exclude = expectedExclude;

      testEntityController.getEntitiesAction(request, response, function(error) {
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

      testEntityController.getEntitiesAction(request, response, function(error) {
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

      testEntityController.getEntitiesAction(request, response, function(error) {
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

      testEntityController.getEntitiesAction(request, response, function(error) {
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

      testEntityController.getEntitiesAction(request, response, function(error) {
        assert.ok(false, 'Unexpected error : ' + error.message);
      });
    });

    it('should set default limit to 10 if not specified', function(done) {
      ProviderMock.get = function(filter, fields, limit, page, sort, callback) {
        assert.equal(limit, 10, 'Wrong limit');
        done();
      };

      testEntityController.getEntitiesAction(request, response, function(error) {
        assert.ok(false, 'Unexpected error : ' + error.message);
      });
    });

    it('should set default page to 0 if not specified', function(done) {
      ProviderMock.get = function(filter, fields, limit, page, sort, callback) {
        assert.equal(page, 0, 'Wrong page');
        done();
      };

      testEntityController.getEntitiesAction(request, response, function(error) {
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
        testEntityController.getEntitiesAction(request, response, function(error) {
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
        testEntityController.getEntitiesAction(request, response, function(error) {
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
        testEntityController.getEntitiesAction(request, response, function(error) {
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
        testEntityController.getEntitiesAction(request, response, function(error) {
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
        testEntityController.getEntitiesAction(request, response, function(error) {
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

      testEntityController.getEntitiesAction(request, response, function(error) {
        assert.equal(error, httpErrors.GET_ENTITIES_ERROR, 'Wrong error');
        done();
      });
    });

  });

  describe('getEntityAction', function() {

    it('should send the entity corresponding to the given id', function(done) {
      var expectedId = 'id';
      expectedEntities = [{}];

      response.send = function(result) {
        assert.strictEqual(result.entity, expectedEntities[0], 'Wrong entity');
        done();
      };

      request.params.id = expectedId;

      testEntityController.getEntityAction(request, response, function(error, entity) {
        assert.isNull(error, 'Unexpected error');
      });
    });

    it('should be able to include only certain fields from the entity', function(done) {
      var expectedInclude = ['field1', 'field2'];

      ProviderMock.getOne = function(filter, fields, callback) {
        assert.deepEqual(fields.include, expectedInclude, 'Wrong include');
        assert.isUndefined(fields.exclude, 'Unexpected exclude');
        done();
      };

      request.params.id = '42';
      request.query.include = expectedInclude;

      testEntityController.getEntityAction(request, response, function(error) {
        assert.ok(false, 'Unexpected error : ' + error.message);
      });
    });

    it('should send an HTTP missing parameters if no id specified', function(done) {
      response.send = function() {
        assert.ok(false, 'Unexpected response');
      };

      testEntityController.getEntityAction(request, response, function(error) {
        assert.strictEqual(error, httpErrors.GET_ENTITY_MISSING_PARAMETERS);
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
        testEntityController.getEntityAction(request, response, function(error) {
          assert.strictEqual(error, httpErrors.GET_ENTITY_WRONG_PARAMETERS);
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
        testEntityController.getEntityAction(request, response, function(error) {
          assert.strictEqual(error, httpErrors.GET_ENTITY_WRONG_PARAMETERS);
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

      testEntityController.getEntityAction(request, response, function(error) {
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

      testEntityController.getEntityAction(request, response, function(error) {
        assert.strictEqual(error, httpErrors.GET_ENTITY_NOT_FOUND, 'Wrong error');
        done();
      });
    });

  });

  describe('updateEntityAction', function() {

    it('should update entity and send operation result', function(done) {
      var expectedData = {};
      var expectedId = '42';

      response.send = function(result) {
        assert.equal(result.total, 1, 'Wrong total');
        done();
      };

      ProviderMock.updateOne = function(filter, data, callback) {
        assert.equal(
          filter.getComparisonOperation(ResourceFilter.OPERATORS.EQUAL, 'id').value,
          expectedId,
          'Wrong id'
        );
        assert.strictEqual(data, expectedData, 'Wrong data');
        callback(null, 1);
      };

      request.params.id = expectedId;
      request.body = expectedData;

      testEntityController.updateEntityAction(request, response, function(error) {
        assert.ok(false, 'Unexpected error');
      });
    });

    it('should send an HTTP missing error if id parameter is not specified', function(done) {
      var expectedData = {};

      response.send = function() {
        assert.ok(false, 'Unexpected response');
      };

      request.body = expectedData;

      testEntityController.updateEntityAction(request, response, function(error) {
        assert.strictEqual(error, httpErrors.UPDATE_ENTITY_MISSING_PARAMETERS, 'Wrong error');
        done();
      });
    });

    it('should send an HTTP missing error if body is not specified', function(done) {
      response.send = function() {
        assert.ok(false, 'Unexpected response');
      };

      request.params.id = '42';

      testEntityController.updateEntityAction(request, response, function(error) {
        assert.strictEqual(error, httpErrors.UPDATE_ENTITY_MISSING_PARAMETERS, 'Wrong error');
        done();
      });
    });

    it('should send an HTTP server error if updating entity failed', function(done) {
      response.send = function() {
        assert.ok(false, 'Unexpected response');
      };

      ProviderMock.updateOne = function(filter, data, callback) {
        callback(new Error('Error'));
      };

      request.params.id = '42';
      request.body = {};

      testEntityController.updateEntityAction(request, response, function(error) {
        assert.strictEqual(error, httpErrors.UPDATE_ENTITY_ERROR, 'Wrong error');
        done();
      });
    });

  });

  describe('addEntitiesAction', function() {

    it('should add entities and send operation result', function(done) {
      var expectedEntities = [{}];

      response.send = function(result) {
        assert.strictEqual(result.entities, expectedEntities, 'Wrong entities');
        assert.equal(result.total, expectedEntities.length, 'Wrong total');
        done();
      };

      ProviderMock.add = function(entities, callback) {
        for (var i = 0; i < entities.length; i++)
          assert.strictEqual(entities[i], expectedEntities[i], 'Wrong entities ' + i);

        callback(null, expectedEntities.length, expectedEntities);
      };

      request.body = expectedEntities;

      testEntityController.addEntitiesAction(request, response, function(error) {
        assert.ok(false, 'Unexpected error');
      });
    });

    it('should send an HTTP missing parameters error if body is not specified', function(done) {
      response.send = function(result) {
        assert.ok(false, 'Unexpected response');
      };

      testEntityController.addEntitiesAction(request, response, function(error) {
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
        testEntityController.addEntitiesAction(request, response, function(error) {
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

      testEntityController.addEntitiesAction(request, response, function(error) {
        assert.strictEqual(error, httpErrors.ADD_ENTITIES_ERROR, 'Wrong error');
        done();
      });

    });

  });

  describe('removeEntitiesAction', function() {

    it('should remove entities and send operation result', function(done) {
      var expectedIds = ['41', '42'];

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

      testEntityController.removeEntitiesAction(request, response, function(error) {
        assert.ok(false, 'Unexpected error');
      });
    });

    it('should send an HTTP missing parameters error if id is not specified', function(done) {
      response.send = function(result) {
        assert.ok(false, 'Unexpected error');
      };

      testEntityController.removeEntitiesAction(request, response, function(error) {
        assert.strictEqual(error, httpErrors.REMOVE_ENTITIES_MISSING_PARAMETERS, 'Wrong error');
        done();
      });
    });

    it('should send an HTTP server error if removing entities failed', function(done) {
      response.send = function(result) {
        assert.ok(false, 'Unexpected error');
      };

      ProviderMock.remove = function(filter, callback) {
        callback(new Error('Error'));
      };

      request.params.id = '42,43';

      testEntityController.removeEntitiesAction(request, response, function(error) {
        assert.strictEqual(error, httpErrors.REMOVE_ENTITIES_ERROR, 'Wrong error');
        done();
      });
    });

    it('should send an HTTP server error if removing entities partially failed', function(done) {
      var expectedIds = ['42', '43'];

      response.send = function(result) {
        assert.ok(false, 'Unexpected error');
      };

      ProviderMock.remove = function(filter, callback) {
        callback(null, expectedIds.length - 1);
      };

      request.params.id = expectedIds.join(',');

      testEntityController.removeEntitiesAction(request, response, function(error) {
        assert.strictEqual(error, httpErrors.REMOVE_ENTITIES_ERROR, 'Wrong error');
        done();
      });
    });

  });

});
