'use strict';

var path = require('path');
var assert = require('chai').assert;
var mock = require('mock-require');
var ResourceFilter = process.requireApi('lib/storages/ResourceFilter.js');

describe('EntityProvider', function() {
  var EntityProvider;
  var Storage;
  var storage;
  var provider;
  var expectedEntity;
  var expectedEntities;
  var expectedLocation = 'location';

  // Initiates mocks
  beforeEach(function() {
    Storage = function() {};
    Storage.prototype.getOne = function(location, filter, fields, callback) {
      callback(null, expectedEntity);
    };
    Storage.prototype.get = function(location, filter, fields, limit, page, sort, callback) {
      callback(null, expectedEntities, {
        limit: limit,
        page: page,
        pages: Math.ceil(expectedEntities.length / limit),
        size: expectedEntities.length
      });
    };
    Storage.prototype.add = function(location, resources, callback) {
      callback(null, resources.length);
    };
    Storage.prototype.updateOne = function(location, filter, data, callback) {
      callback(null, 42);
    };
    Storage.prototype.remove = function(location, filter, callback) {
      callback(null, 42);
    };
    Storage.prototype.removeField = function(location, field, filter, callback) {
      callback(null, 42);
    };

    mock(path.join(process.rootApi, 'lib/storages/Storage.js'), Storage);
  });

  // Initiates tests
  beforeEach(function() {
    mock.reRequire(path.join(process.rootApi, 'lib/providers/Provider.js'));
    EntityProvider = mock.reRequire(path.join(process.rootApi, 'lib/providers/EntityProvider.js'));
    storage = new Storage({});
    provider = new EntityProvider(storage, expectedLocation);
  });

  // Stop mocks
  afterEach(function() {
    mock.stopAll();
  });

  describe('properties', function() {

    it('should not be editable', function() {
      var properties = ['location'];
      var provider = new EntityProvider(new Storage({}), 'location');

      properties.forEach(function(property) {
        assert.throws(function() {
          provider[property] = null;
        }, null, null, 'Expected property "' + property + '" to be unalterable');
      });

    });

  });

  describe('constructor', function() {

    it('should throw a TypeError if location is not a String', function() {
      var wrongValues = [true, 42, {}, [], function() {}];

      wrongValues.forEach(function(wrongValue) {
        assert.throws(function() {
          new EntityProvider(new Storage({}), wrongValue);
        });
      });
    });

  });

  describe('getOne', function() {

    it('should fetch an entity by a filter', function(done) {
      var expectedFilter = new ResourceFilter();
      var expectedFields = {
        include: ['field1']
      };
      expectedEntity = {id: 42};

      storage.getOne = function(location, filter, fields, callback) {
        assert.equal(location, expectedLocation, 'Wrong location');
        assert.strictEqual(filter, expectedFilter, 'Wrong filter');
        assert.strictEqual(fields, expectedFields, 'Wrong fields');
        callback(null, expectedEntity);
      };

      provider.getOne(
        expectedFilter,
        expectedFields,
        function(error, entity) {
          assert.isNull(error, 'Unexpected error');
          assert.strictEqual(entity, expectedEntity, 'Wrong entity');
          done();
        }
      );
    });

  });

  describe('get', function() {

    it('should fetch a list of entities', function(done) {
      var expectedFilter = new ResourceFilter();
      var expectedFields = {
        include: ['field1']
      };
      var expectedLimit = 10;
      var expectedPage = 42;
      var expectedSort = {field: 'asc'};
      expectedEntities = [{}];

      storage.get = function(location, filter, fields, limit, page, sort, callback) {
        assert.equal(location, expectedLocation, 'Wrong location');
        assert.strictEqual(filter, expectedFilter, 'Wrong filter');
        assert.strictEqual(fields, expectedFields, 'Wrong fields');
        assert.equal(limit, expectedLimit, 'Wrong limit');
        assert.equal(page, expectedPage, 'Wrong page');
        assert.strictEqual(sort, expectedSort, 'Wrong sort');
        callback(null, expectedEntities);
      };

      provider.get(
        expectedFilter,
        expectedFields,
        expectedLimit,
        expectedPage,
        expectedSort,
        function(error, entities) {
          assert.isNull(error, 'Unexpected error');
          assert.strictEqual(entities, expectedEntities, 'Wrong entity');
          done();
        }
      );
    });

  });

  describe('add', function() {

    it('should add a list of entities', function(done) {
      var expectedEntities = [
        {
          id: '42',
          field: 'value1'
        },
        {
          id: '43',
          field: 'value2'
        }
      ];

      storage.add = function(location, resources, callback) {
        assert.equal(location, expectedLocation, 'Wrong location');
        assert.deepEqual(resources, expectedEntities, 'Wrong resources');
        callback(null, expectedEntities.length, expectedEntities);
      };

      provider.add(
        expectedEntities,
        function(error, insertedCount, entities) {
          assert.isNull(error, 'Unexpected error');
          assert.equal(insertedCount, expectedEntities.length, 'Wrong number of inserted entities');
          assert.strictEqual(entities, expectedEntities, 'Wrong entities');
          done();
        }
      );
    });

    it('should execute callback without results nor error if no entities specified', function(done) {
      provider.add(
        [],
        function(error, insertedCount, entities) {
          assert.isNull(error, 'Unexpected error');
          assert.equal(insertedCount, 0, 'Wrong number of inserted entities');
          assert.isUndefined(entities, 'Unexpected entities');
          done();
        }
      );
    });
  });

  describe('updateOne', function() {

    it('should update an entity', function(done) {
      var expectedFilter = new ResourceFilter();
      var expectedData = {field: 'value'};
      var expectedUpdatedCount = 1;

      storage.updateOne = function(location, filter, data, callback) {
        assert.equal(location, expectedLocation, 'Wrong location');
        assert.strictEqual(filter, expectedFilter, 'Wrong filter');
        assert.strictEqual(data, expectedData, 'Wrong data');
        callback(null, expectedUpdatedCount);
      };

      provider.updateOne(
        expectedFilter,
        expectedData,
        function(error, updatedCount) {
          assert.isNull(error, 'Unexpected error');
          assert.equal(updatedCount, expectedUpdatedCount, 'Wrong updated count');
          done();
        }
      );
    });

  });

  describe('remove', function() {

    it('should remove a list of entities', function(done) {
      var expectedFilter = new ResourceFilter();
      var expectedUpdatedCount = 42;

      storage.remove = function(location, filter, callback) {
        assert.equal(location, expectedLocation, 'Wrong location');
        assert.strictEqual(filter, expectedFilter, 'Wrong filter');
        callback(null, expectedUpdatedCount);
      };

      provider.remove(
        expectedFilter,
        function(error, updatedCount) {
          assert.isNull(error, 'Unexpected error');
          assert.equal(updatedCount, expectedUpdatedCount, 'Wrong updated count');
          done();
        }
      );
    });

  });

  describe('removeField', function() {

    it('should remove a field from a list of entities', function(done) {
      var expectedFilter = new ResourceFilter();
      var expectedField = 'field';
      var expectedUpdatedCount = 42;

      storage.removeField = function(location, field, filter, callback) {
        assert.equal(location, expectedLocation, 'Wrong location');
        assert.equal(field, expectedField, 'Wrong field');
        assert.strictEqual(filter, expectedFilter, 'Wrong filter');
        callback(null, expectedUpdatedCount);
      };

      provider.removeField(
        expectedField,
        expectedFilter,
        function(error, updatedCount) {
          assert.isNull(error, 'Unexpected error');
          assert.equal(updatedCount, expectedUpdatedCount, 'Wrong updated count');
          done();
        }
      );
    });

  });

  describe('getAll', function() {

    it('should fetch all entities in all pages', function(done) {
      var expectedPage = 0;
      var expectedSize = 100;
      var expectedFilter = new ResourceFilter();
      var expectedFields = {
        include: ['field1']
      };
      var expectedSort = {
        field1: 'asc'
      };
      expectedEntities = [];

      for (var i = 0; i < expectedSize; i++)
        expectedEntities.push({id: i});

      storage.get = function(location, filter, fields, limit, page, sort, callback) {
        assert.equal(location, expectedLocation, 'Wrong location');
        assert.strictEqual(filter, expectedFilter, 'Wrong filter');
        assert.strictEqual(fields, expectedFields, 'Wrong fields');
        assert.isNull(limit, 'Unexpected limit');
        assert.equal(page, expectedPage, 'Wrong page');
        assert.strictEqual(sort, expectedSort, 'Wrong sort');
        expectedPage++;
        callback(
          null,
          expectedEntities.slice(page * 10, page * 10 + 10),
          {
            limit: 10,
            page: page,
            pages: Math.ceil(expectedEntities.length / 10),
            size: expectedEntities.length
          }
        );
      };

      provider.getAll(
        expectedFilter,
        expectedFields,
        expectedSort,
        function(error, entities) {
          assert.isNull(error, 'Unexpected error');
          assert.equal(expectedPage, (expectedSize / 10), 'Wrong number of pages');
          assert.deepEqual(entities, expectedEntities, 'Wrong entities');
          done();
        }
      );
    });

    it('should execute callback with an error if getting a page failed', function(done) {
      var expectedError = new Error('Something went wrong');
      expectedEntities = [];

      storage.get = function(location, filter, fields, limit, page, sort, callback) {
        callback(expectedError);
      };

      provider.getAll(
        new ResourceFilter(),
        null,
        null,
        function(error, entities) {
          assert.strictEqual(error, expectedError, 'Wrong error');
          done();
        }
      );
    });

  });

});
