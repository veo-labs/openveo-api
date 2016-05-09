'use strict';

var assert = require('chai').assert;
var EntityController = process.requireAPI('lib/controllers/EntityController.js');
var AccessError = process.requireAPI('lib/errors/AccessError.js');

// EntityController.js
describe('EntityController', function() {
  var EntityModel;
  var entityController;

  beforeEach(function() {
    EntityModel = function() {};
    entityController = new EntityController(EntityModel);
  });

  // getEntitiesAction method
  describe('getEntitiesAction', function() {

    it('should send the list of entities returned by the model', function(done) {
      var expectedEntities = {};
      EntityModel.prototype.get = function(filter, callback) {
        callback(null, expectedEntities);
      };

      var response = {
        send: function(entities) {
          assert.strictEqual(entities.entities, expectedEntities, 'Expected a list of entities');
          done();
        }
      };

      entityController.getEntitiesAction({}, response, function(error) {
        assert.ok(false, 'Unexpected error : ' + error.message);
      });
    });

    it('should send an HTTP forbidden error if model return an access error', function(done) {
      EntityModel.prototype.get = function(filter, callback) {
        callback(new AccessError('Error'));
      };

      var response = {
        send: function(entities) {
          assert.ok(false, 'Unexpected response');
        }
      };

      entityController.getEntitiesAction({}, response, function(error) {
        assert.equal(error.httpCode, 403);
        done();
      });
    });

    it('should send an HTTP server error if model return an error', function(done) {
      EntityModel.prototype.get = function(filter, callback) {
        callback(new Error('Error'));
      };

      var response = {
        send: function(entities) {
          assert.ok(false, 'Unexpected response');
        }
      };

      entityController.getEntitiesAction({}, response, function(error) {
        assert.equal(error.httpCode, 500);
        done();
      });
    });

  });

  // getEntityAction method
  describe('getEntityAction', function() {

    it('should send the entity returned by the model', function(done) {
      var expectedEntity = {};
      EntityModel.prototype.getOne = function(id, filter, callback) {
        callback(null, expectedEntity);
      };

      var response = {
        send: function(entity) {
          assert.strictEqual(entity.entity, expectedEntity, 'Expected entity');
          done();
        }
      };

      entityController.getEntityAction({params: {id: 1}}, response, function(error) {
        assert.ok(false, 'Unexpected error : ' + error.message);
      });
    });

    it('should send an HTTP forbidden error if model return an access error', function(done) {
      EntityModel.prototype.getOne = function(id, filter, callback) {
        callback(new AccessError('Error'));
      };

      var response = {
        send: function(entity) {
          assert.ok(false, 'Unexpected response');
        }
      };

      entityController.getEntityAction({params: {id: 1}}, response, function(error) {
        assert.equal(error.httpCode, 403);
        done();
      });
    });

    it('should send an HTTP server error if model return an error', function(done) {
      EntityModel.prototype.getOne = function(id, filter, callback) {
        callback(new Error('Error'));
      };

      var response = {
        send: function(entity) {
          assert.ok(false, 'Unexpected response');
        }
      };

      entityController.getEntityAction({params: {id: 1}}, response, function(error) {
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

      entityController.getEntityAction({params: {}}, response, function(error) {
        assert.equal(error.httpCode, 400);
        done();
      });
    });

  });

  // updateEntityAction method
  describe('updateEntityAction', function() {

    it('should send a status "ok" if entity has been updated', function(done) {
      EntityModel.prototype.update = function(id, data, callback) {
        callback(null, 1);
      };

      var response = {
        send: function(res) {
          assert.equal(res.status, 'ok');
          done();
        }
      };

      entityController.updateEntityAction({params: {id: 1}, body: {}}, response, function(error) {
        assert.ok(false, 'Unexpected error : ' + error.message);
      });
    });

    it('should send an HTTP forbidden error if model return an access error', function(done) {
      EntityModel.prototype.update = function(id, data, callback) {
        callback(new AccessError('Error'));
      };

      var response = {
        send: function(res) {
          assert.ok(false, 'Unexpected response');
        }
      };

      entityController.updateEntityAction({params: {id: 1}, body: {}}, response, function(error) {
        assert.equal(error.httpCode, 403);
        done();
      });
    });

    it('should send an HTTP server error if model return an error', function(done) {
      EntityModel.prototype.update = function(id, data, callback) {
        callback(new Error('Error'));
      };

      var response = {
        send: function(res) {
          assert.ok(false, 'Unexpected response');
        }
      };

      entityController.updateEntityAction({params: {id: 1}, body: {}}, response, function(error) {
        assert.equal(error.httpCode, 500);
        done();
      });
    });

    it('should send an HTTP server error if model has not update any entity', function(done) {
      EntityModel.prototype.update = function(id, data, callback) {
        callback(null, 0);
      };

      var response = {
        send: function(res) {
          assert.ok(false, 'Unexpected response');
        }
      };

      entityController.updateEntityAction({params: {id: 1}, body: {}}, response, function(error) {
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

      entityController.updateEntityAction({params: {}, body: {}}, response, function(error) {
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

      entityController.updateEntityAction({params: {id: 1}}, response, function(error) {
        assert.equal(error.httpCode, 400);
        done();
      });
    });

  });

  // addEntityAction method
  describe('addEntityAction', function() {

    it('should send the added entity', function(done) {
      var expectedEntity = {};
      EntityModel.prototype.add = function(data, callback) {
        callback(null, 1, expectedEntity);
      };

      var response = {
        send: function(entity) {
          assert.strictEqual(entity.entity, expectedEntity);
          done();
        }
      };

      entityController.addEntityAction({body: {}}, response, function(error) {
        assert.ok(false, 'Unexpected error : ' + error.message);
      });
    });

    it('should send an HTTP forbidden error if model return an access error', function(done) {
      EntityModel.prototype.add = function(data, callback) {
        callback(new AccessError('Error'));
      };

      var response = {
        send: function(entity) {
          assert.ok(false, 'Unexpected response');
        }
      };

      entityController.addEntityAction({body: {}}, response, function(error) {
        assert.equal(error.httpCode, 403);
        done();
      });
    });

    it('should send an HTTP server error if model return an error', function(done) {
      EntityModel.prototype.add = function(data, callback) {
        callback(new Error('Error'));
      };

      var response = {
        send: function(entity) {
          assert.ok(false, 'Unexpected response');
        }
      };

      entityController.addEntityAction({body: {}}, response, function(error) {
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

      entityController.addEntityAction({}, response, function(error) {
        assert.equal(error.httpCode, 400);
        done();
      });
    });

  });

  // removeEntityAction method
  describe('removeEntityAction', function() {

    it('should send a status "ok" if the entity has been removed', function(done) {
      EntityModel.prototype.remove = function(ids, callback) {
        callback(null, 1);
      };

      var response = {
        send: function(res) {
          assert.equal(res.status, 'ok');
          done();
        }
      };

      entityController.removeEntityAction({params: {id: '42'}}, response, function(error) {
        assert.ok(false, 'Unexpected error : ' + error.message);
      });
    });

    it('should be able to ask model to remove a list of entities', function(done) {
      var expectedIds = ['1', '2', '3'];
      EntityModel.prototype.remove = function(ids, callback) {
        assert.sameMembers(ids, expectedIds, 'Expected ids to be the same as the one specified in the request');
        callback(null, 3);
      };

      var response = {
        send: function(res) {
          assert.equal(res.status, 'ok');
          done();
        }
      };

      entityController.removeEntityAction({params: {id: expectedIds.join(',')}}, response, function(error) {
        assert.ok(false, 'Unexpected error : ' + error.message);
      });
    });

    it('should send an HTTP server error if model has not removed the expected number of entities', function(done) {
      var expectedIds = ['1', '2', '3'];
      EntityModel.prototype.remove = function(ids, callback) {
        assert.sameMembers(ids, expectedIds, 'Expected ids to be the same as the one specified in the request');
        callback(null, 2);
      };

      var response = {
        send: function(res) {
          assert.ok(false, 'Unexpected response');
        }
      };

      entityController.removeEntityAction({params: {id: expectedIds.join(',')}}, response, function(error) {
        assert.equal(error.httpCode, 500);
        done();
      });
    });

    it('should send an HTTP server error if model return an error', function(done) {
      EntityModel.prototype.remove = function(ids, callback) {
        callback(new Error('Error'));
      };

      var response = {
        send: function(res) {
          assert.ok(false, 'Unexpected response');
        }
      };

      entityController.removeEntityAction({params: {id: '42'}}, response, function(error) {
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

      entityController.removeEntityAction({params: {}}, response, function(error) {
        assert.equal(error.httpCode, 400);
        done();
      });
    });

  });

});
