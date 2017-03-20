'use strict';

var util = require('util');
var assert = require('chai').assert;
var EntityController = process.requireApi('lib/controllers/EntityController.js');
var AccessError = process.requireApi('lib/errors/AccessError.js');
var EntityModel = process.requireApi('lib/models/EntityModel.js');
var EntityProvider = process.requireApi('lib/providers/EntityProvider.js');
var Database = process.requireApi('lib/database/Database.js');

// EntityController.js
describe('EntityController', function() {
  var TestEntityModel;
  var TestEntityProvider;
  var TestEntityController;
  var testEntityController;

  // Mocks
  beforeEach(function() {
    TestEntityModel = function(provider) {
      TestEntityModel.super_.call(this, provider);
    };

    TestEntityProvider = function(database) {
      TestEntityProvider.super_.call(this, database, 'test_collection');
    };

    TestEntityController = function(ModelConstructor, ProviderConstructor) {
      TestEntityController.super_.call(this, ModelConstructor, ProviderConstructor);
    };

    TestEntityController.prototype.getModel = function() {
      return new TestEntityModel(new TestEntityProvider(new Database({})));
    };

    util.inherits(TestEntityModel, EntityModel);
    util.inherits(TestEntityProvider, EntityProvider);
    util.inherits(TestEntityController, EntityController);
  });

  // Prepare tests using mocks
  beforeEach(function() {
    testEntityController = new TestEntityController();
  });

  // getEntitiesAction method
  describe('getEntitiesAction', function() {

    it('should send the list of entities returned by the model', function(done) {
      var expectedEntities = {};
      TestEntityModel.prototype.get = function(filter, callback) {
        callback(null, expectedEntities);
      };

      var response = {
        send: function(entities) {
          assert.strictEqual(entities.entities, expectedEntities, 'Expected a list of entities');
          done();
        }
      };

      testEntityController.getEntitiesAction({}, response, function(error) {
        assert.ok(false, 'Unexpected error : ' + error.message);
      });
    });

    it('should send an HTTP forbidden error if model return an access error', function(done) {
      TestEntityModel.prototype.get = function(filter, callback) {
        callback(new AccessError('Error'));
      };

      var response = {
        send: function(entities) {
          assert.ok(false, 'Unexpected response');
        }
      };

      testEntityController.getEntitiesAction({}, response, function(error) {
        assert.equal(error.httpCode, 403);
        done();
      });
    });

    it('should send an HTTP server error if model return an error', function(done) {
      TestEntityModel.prototype.get = function(filter, callback) {
        callback(new Error('Error'));
      };

      var response = {
        send: function(entities) {
          assert.ok(false, 'Unexpected response');
        }
      };

      testEntityController.getEntitiesAction({}, response, function(error) {
        assert.equal(error.httpCode, 500);
        done();
      });
    });

  });

  // getEntityAction method
  describe('getEntityAction', function() {

    it('should send the entity returned by the model', function(done) {
      var expectedEntity = {};
      TestEntityModel.prototype.getOne = function(id, filter, callback) {
        callback(null, expectedEntity);
      };

      var response = {
        send: function(entity) {
          assert.strictEqual(entity.entity, expectedEntity, 'Expected entity');
          done();
        }
      };

      testEntityController.getEntityAction({params: {id: 1}}, response, function(error) {
        assert.ok(false, 'Unexpected error : ' + error.message);
      });
    });

    it('should send an HTTP forbidden error if model return an access error', function(done) {
      TestEntityModel.prototype.getOne = function(id, filter, callback) {
        callback(new AccessError('Error'));
      };

      var response = {
        send: function(entity) {
          assert.ok(false, 'Unexpected response');
        }
      };

      testEntityController.getEntityAction({params: {id: 1}}, response, function(error) {
        assert.equal(error.httpCode, 403);
        done();
      });
    });

    it('should send an HTTP server error if model return an error', function(done) {
      TestEntityModel.prototype.getOne = function(id, filter, callback) {
        callback(new Error('Error'));
      };

      var response = {
        send: function(entity) {
          assert.ok(false, 'Unexpected response');
        }
      };

      testEntityController.getEntityAction({params: {id: 1}}, response, function(error) {
        assert.equal(error.httpCode, 500);
        done();
      });
    });

    it('should send an HTTP missing parameter error if id is not specified', function(done) {
      var response = {
        send: function(entity) {
          assert.ok(false, 'Unexpected response');
        }
      };

      testEntityController.getEntityAction({params: {}}, response, function(error) {
        assert.equal(error.httpCode, 400);
        done();
      });
    });

    it('should send an HTTP not found error if entity is not found', function(done) {
      TestEntityModel.prototype.getOne = function(id, filter, callback) {
        callback(null);
      };

      var response = {
        send: function(entity) {
          assert.ok(false, 'Unexpected response');
        }
      };

      testEntityController.getEntityAction({params: {id: 1}}, response, function(error) {
        assert.equal(error.httpCode, 404);
        done();
      });
    });

  });

  // updateEntityAction method
  describe('updateEntityAction', function() {

    it('should send a status "ok" if entity has been updated', function(done) {
      TestEntityModel.prototype.update = function(id, data, callback) {
        callback(null, 1);
      };

      var response = {
        send: function(res) {
          assert.equal(res.status, 'ok');
          done();
        }
      };

      testEntityController.updateEntityAction({params: {id: 1}, body: {}}, response, function(error) {
        assert.ok(false, 'Unexpected error : ' + error.message);
      });
    });

    it('should send an HTTP forbidden error if model return an access error', function(done) {
      TestEntityModel.prototype.update = function(id, data, callback) {
        callback(new AccessError('Error'));
      };

      var response = {
        send: function(res) {
          assert.ok(false, 'Unexpected response');
        }
      };

      testEntityController.updateEntityAction({params: {id: 1}, body: {}}, response, function(error) {
        assert.equal(error.httpCode, 403);
        done();
      });
    });

    it('should send an HTTP server error if model return an error', function(done) {
      TestEntityModel.prototype.update = function(id, data, callback) {
        callback(new Error('Error'));
      };

      var response = {
        send: function(res) {
          assert.ok(false, 'Unexpected response');
        }
      };

      testEntityController.updateEntityAction({params: {id: 1}, body: {}}, response, function(error) {
        assert.equal(error.httpCode, 500);
        done();
      });
    });

    it('should send an HTTP missing parameter error if id is not specified', function(done) {
      var response = {
        send: function(entity) {
          assert.ok(false, 'Unexpected response');
        }
      };

      testEntityController.updateEntityAction({params: {}, body: {}}, response, function(error) {
        assert.equal(error.httpCode, 400);
        done();
      });
    });

    it('should send an HTTP missing parameter error if body is empty', function(done) {
      var response = {
        send: function(entity) {
          assert.ok(false, 'Unexpected response');
        }
      };

      testEntityController.updateEntityAction({params: {id: 1}}, response, function(error) {
        assert.equal(error.httpCode, 400);
        done();
      });
    });

  });

  // addEntityAction method
  describe('addEntityAction', function() {

    it('should send the added entity', function(done) {
      var expectedEntity = {};
      TestEntityModel.prototype.add = function(data, callback) {
        callback(null, 1, expectedEntity);
      };

      var response = {
        send: function(entity) {
          assert.strictEqual(entity.entity, expectedEntity);
          done();
        }
      };

      testEntityController.addEntityAction({body: {}}, response, function(error) {
        assert.ok(false, 'Unexpected error : ' + error.message);
      });
    });

    it('should send an HTTP forbidden error if model return an access error', function(done) {
      TestEntityModel.prototype.add = function(data, callback) {
        callback(new AccessError('Error'));
      };

      var response = {
        send: function(entity) {
          assert.ok(false, 'Unexpected response');
        }
      };

      testEntityController.addEntityAction({body: {}}, response, function(error) {
        assert.equal(error.httpCode, 403);
        done();
      });
    });

    it('should send an HTTP server error if model return an error', function(done) {
      TestEntityModel.prototype.add = function(data, callback) {
        callback(new Error('Error'));
      };

      var response = {
        send: function(entity) {
          assert.ok(false, 'Unexpected response');
        }
      };

      testEntityController.addEntityAction({body: {}}, response, function(error) {
        assert.equal(error.httpCode, 500);
        done();
      });
    });

    it('should send an HTTP missing parameter error if body is empty', function(done) {
      var response = {
        send: function(entity) {
          assert.ok(false, 'Unexpected response');
        }
      };

      testEntityController.addEntityAction({}, response, function(error) {
        assert.equal(error.httpCode, 400);
        done();
      });
    });

  });

  // removeEntityAction method
  describe('removeEntityAction', function() {

    it('should send a status "ok" if the entity has been removed', function(done) {
      TestEntityModel.prototype.remove = function(ids, callback) {
        callback(null, 1);
      };

      var response = {
        send: function(res) {
          assert.equal(res.status, 'ok');
          done();
        }
      };

      testEntityController.removeEntityAction({params: {id: '42'}}, response, function(error) {
        assert.ok(false, 'Unexpected error : ' + error.message);
      });
    });

    it('should be able to ask model to remove a list of entities', function(done) {
      var expectedIds = ['1', '2', '3'];
      TestEntityModel.prototype.remove = function(ids, callback) {
        assert.sameMembers(ids, expectedIds, 'Expected ids to be the same as the one specified in the request');
        callback(null, 3);
      };

      var response = {
        send: function(res) {
          assert.equal(res.status, 'ok');
          done();
        }
      };

      testEntityController.removeEntityAction({params: {id: expectedIds.join(',')}}, response, function(error) {
        assert.ok(false, 'Unexpected error : ' + error.message);
      });
    });

    it('should send an HTTP server error if model has not removed the expected number of entities', function(done) {
      var expectedIds = ['1', '2', '3'];
      TestEntityModel.prototype.remove = function(ids, callback) {
        assert.sameMembers(ids, expectedIds, 'Expected ids to be the same as the one specified in the request');
        callback(null, 2);
      };

      var response = {
        send: function(res) {
          assert.ok(false, 'Unexpected response');
        }
      };

      testEntityController.removeEntityAction({params: {id: expectedIds.join(',')}}, response, function(error) {
        assert.equal(error.httpCode, 500);
        done();
      });
    });

    it('should send an HTTP server error if model return an error', function(done) {
      TestEntityModel.prototype.remove = function(ids, callback) {
        callback(new Error('Error'));
      };

      var response = {
        send: function(res) {
          assert.ok(false, 'Unexpected response');
        }
      };

      testEntityController.removeEntityAction({params: {id: '42'}}, response, function(error) {
        assert.equal(error.httpCode, 500);
        done();
      });
    });

    it('should send an HTTP missing parameter error if id is not specified', function(done) {
      var response = {
        send: function(res) {
          assert.ok(false, 'Unexpected response');
        }
      };

      testEntityController.removeEntityAction({params: {}}, response, function(error) {
        assert.equal(error.httpCode, 400);
        done();
      });
    });

  });

});