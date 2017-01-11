'use strict';

var util = require('util');
var assert = require('chai').assert;
var EntityProvider = process.requireApi('lib/providers/EntityProvider.js');
var Database = process.requireApi('lib/database/Database.js');

// EntityProvider.js
describe('EntityProvider', function() {
  var provider;
  var database;
  var TestDatabase;

  // Mocks
  beforeEach(function() {
    TestDatabase = function(conf) {
      TestDatabase.super_.call(this, conf);
    };

    util.inherits(TestDatabase, Database);
  });

  // Prepare tests
  beforeEach(function() {
    database = new TestDatabase({});
    provider = new EntityProvider(database, 'collection');
  });

  // getOne function
  describe('getOne', function() {

    it('should remove _id property from results', function(done) {
      database.get = function(collection, criteria, projection, limit, callback) {
        assert.equal(projection['_id'], 0);
        done();
      };

      provider.getOne(42);
    });

    it('should be able to get an entity by its id', function(done) {
      var expectedId = 42;
      database.get = function(collection, criteria, projection, limit, callback) {
        assert.equal(criteria['id'], expectedId);
        done();
      };

      provider.getOne(expectedId);
    });

    it('should execute callback with the expected entity', function(done) {
      var expectedEntity = {id: 42};
      database.get = function(collection, criteria, projection, limit, callback) {
        callback(null, [expectedEntity]);
      };
      provider.getOne(expectedEntity.id, null, function(error, entity) {
        assert.strictEqual(expectedEntity, entity);
        done();
      });
    });

    it('should execute callback with an error if an error occurred', function(done) {
      var expectedError = new Error('Something went wrong');
      database.get = function(collection, criteria, projection, limit, callback) {
        callback(expectedError);
      };
      provider.getOne(42, null, function(error, entity) {
        assert.strictEqual(expectedError, error, 'Expected an error');
        assert.isUndefined(entity, 'Unexpected entity');
        done();
      });
    });

  });

  // get function
  describe('get', function() {

    it('should remove _id property from results', function(done) {
      database.get = function(collection, criteria, projection, limit, callback) {
        assert.equal(projection['_id'], 0);
        done();
      };

      provider.get(42);
    });

  });

  // add function
  describe('add', function() {

    it('should be able to add several entities', function(done) {
      var expectedEntities = [{id: 41}, {id: 42}];
      database.insert = function(collection, data, callback) {
        assert.strictEqual(data, expectedEntities);
        done();
      };

      provider.add(expectedEntities);
    });

    it('should be able to add one entity', function(done) {
      var expectedEntity = {id: 42};
      database.insert = function(collection, data, callback) {
        assert.deepEqual(data, [expectedEntity]);
        done();
      };

      provider.add(expectedEntity);
    });

  });

  // update function
  describe('update', function() {

    it('should be able to update an entity', function(done) {
      var expectedId = 42;
      database.update = function(collection, filter, data, callback) {
        assert.equal(filter.id, expectedId);
        done();
      };

      provider.update(expectedId);
    });

    it('should not update a locked entity', function(done) {
      database.update = function(collection, filter, data, callback) {
        assert.ok(filter.locked.$ne);
        done();
      };

      provider.update(42);
    });

  });

  // remove function
  describe('remove', function() {

    it('should be able to remove several entities', function(done) {
      var expectedIds = [41, 42];
      database.remove = function(collection, filter, callback) {
        assert.equal(filter.id.$in, expectedIds);
        done();
      };

      provider.remove(expectedIds);
    });

    it('should not remove a locked entity', function(done) {
      database.remove = function(collection, filter, callback) {
        assert.ok(filter.locked.$ne);
        done();
      };

      provider.remove(42);
    });

  });

  // removeProp function
  describe('removeProp', function() {

    it('should be able to remove a property from all entities', function(done) {
      var expectedProperty = 'test';
      database.removeProp = function(collection, property, filter, callback) {
        assert.equal(property, expectedProperty);
        done();
      };

      provider.removeProp(expectedProperty);
    });

    it('should not remove property on a locked entity', function(done) {
      database.removeProp = function(collection, property, filter, callback) {
        assert.ok(filter.locked.$ne);
        done();
      };

      provider.removeProp('test');
    });

  });

  // increase function
  describe('increase', function() {

    it('should be able to increase a property of an entity', function(done) {
      var expectedId = 42;
      var expectedData = {test1: 41, test2: 42};
      database.increase = function(collection, filter, data, callback) {
        assert.equal(filter.id, expectedId);
        assert.strictEqual(data, expectedData);
        done();
      };

      provider.increase(expectedId, expectedData);
    });

    it('should not increase a property on a locked entity', function(done) {
      database.increase = function(collection, filter, data, callback) {
        assert.ok(filter.locked.$ne);
        done();
      };

      provider.increase(42);
    });

  });

});
