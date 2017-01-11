'use strict';

var util = require('util');
var chai = require('chai');
var spies = require('chai-spies');
var EntityModel = process.requireApi('lib/models/EntityModel.js');
var EntityProvider = process.requireApi('lib/providers/EntityProvider.js');
var Database = process.requireApi('lib/database/Database.js');
var assert = chai.assert;

chai.should();
chai.use(spies);

// ContentModel.js
describe('ContentModel', function() {
  var TestProvider;
  var provider;

  // Mocks
  beforeEach(function() {
    TestProvider = function(database, collection) {
      TestProvider.super_.call(this, database, collection);

      this.getOne = function(id, filter, callback) {
        callback();
      };

      this.get = function(filter, callback) {
        callback();
      };

      this.update = function(id, data, callback) {
        callback();
      };

      this.remove = function(ids, callback) {
        callback();
      };
    };

    util.inherits(TestProvider, EntityProvider);
  });

  // Prepare tests
  beforeEach(function() {
    provider = new TestProvider(new Database({}), 'my_collection');
  });

  describe('getOne', function() {

    it('should ask provider for the entity', function() {
      var model = new EntityModel(provider);
      var expectedId = 42;
      var expectedFilter = {};
      var expectedCallback = function() {};
      provider.getOne = chai.spy(provider.getOne);

      model.getOne(expectedId, expectedFilter, expectedCallback);

      provider.getOne.should.have.been.called.with.exactly(expectedId, expectedFilter, expectedCallback);
    });

  });

  describe('get', function() {

    it('should ask provider for the entities', function() {
      var model = new EntityModel(provider);
      var expectedFilter = {};
      var expectedCallback = function() {};
      provider.get = chai.spy(provider.get);

      model.get(expectedFilter, expectedCallback);

      provider.get.should.have.been.called.with.exactly(expectedFilter, expectedCallback);
    });

  });

  // add method
  describe('add', function() {

    it('should generate an id if not specified', function(done) {
      var model = new EntityModel(provider);
      provider.add = function(data, callback) {
        assert.isString(data.id);
        done();
      };

      model.add({});
    });

    it('should use given id if specified', function(done) {
      var model = new EntityModel(provider);
      var entity = {id: 42};
      provider.add = function(data, callback) {
        assert.equal(data.id, entity.id);
        done();
      };

      model.add(entity);
    });

    it('should execute callback with the total inserted documents and the first document', function(done) {
      var model = new EntityModel(provider);
      var entity = {id: 42};
      var expectedDocuments = [entity];

      provider.add = function(data, callback) {
        callback(null, expectedDocuments.length, expectedDocuments);
      };

      model.add(entity, function(error, total, entity) {
        assert.equal(total, expectedDocuments.length);
        assert.strictEqual(entity, expectedDocuments[0]);
        done();
      });
    });

    it('should execute callback with an error if provider sends an error', function(done) {
      var model = new EntityModel(provider);
      var expectedError = new Error('Error message');

      provider.add = function(data, callback) {
        callback(expectedError);
      };

      model.add({}, function(error, total, entity) {
        assert.strictEqual(error, expectedError);
        done();
      });
    });
  });

  describe('update', function() {

    it('should ask provider to update an entity', function() {
      var model = new EntityModel(provider);
      var expectedId = 42;
      var expectedData = {};
      var expectedCallback = function() {};
      provider.update = chai.spy(provider.update);

      model.update(expectedId, expectedData, expectedCallback);

      provider.update.should.have.been.called.with.exactly(expectedId, expectedData, expectedCallback);
    });

  });

  describe('remove', function() {

    it('should ask provider to remove entities', function() {
      var model = new EntityModel(provider);
      var expectedIds = [42];
      var expectedCallback = function() {};
      provider.remove = chai.spy(provider.remove);

      model.remove(expectedIds, expectedCallback);

      provider.remove.should.have.been.called.with.exactly(expectedIds, expectedCallback);
    });

  });

});
