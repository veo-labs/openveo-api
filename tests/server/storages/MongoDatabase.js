'use strict';

var path = require('path');
var chai = require('chai');
var spies = require('chai-spies');
var mock = require('mock-require');

var ResourceFilter = process.requireApi('lib/storages/ResourceFilter.js');
var databaseErrors = process.requireApi('lib/storages/databases/databaseErrors.js');

var MongoDatabase;
var MongoClientMock;
var MongoObjectIdMock;
var MongoStoreMock;
var database;
var collection;
var cursor;
var commandCursor;
var documents;
var expectedDocuments;
var expectedDatabase;
var assert = chai.assert;

chai.should();
chai.use(spies);

describe('MongoDatabase', function() {

  // Initiates mocks
  beforeEach(function() {
    MongoClientMock = {
      connect: function(url, options, callback) {
        callback(null, MongoClientMock);
      },
      close: function() {},
      db: function() {
        return expectedDatabase;
      }
    };
    MongoStoreMock = function() {};
    MongoObjectIdMock = function(id) {
      this.id = id;
    };
    MongoObjectIdMock.prototype.toHexString = function() {
      return this.id;
    };

    mock('mongodb', {MongoClient: MongoClientMock, ObjectId: MongoObjectIdMock});
    mock('connect-mongo', function() {
      return MongoStoreMock;
    });
  });

  // Load module to test
  beforeEach(function() {
    MongoDatabase = mock.reRequire(path.join(process.rootApi, 'lib/storages/databases/mongodb/MongoDatabase.js'));
    database = new MongoDatabase({});
    database.db = {
      collection: chai.spy(function(name) {
        return collection;
      }),
      dropCollection: chai.spy(function(name, callback) {
        callback();
      }),
      listCollections: chai.spy(function(filter, options) {
        return commandCursor;
      })
    };
  });

  // Mock MongoDB Cursor and Collection
  beforeEach(function() {
    documents = [];
    expectedDocuments = null;
    expectedDatabase = {};

    // Mock MongoDB Cursor
    cursor = {
      project: chai.spy(function() {
        return cursor;
      }),
      sort: chai.spy(function() {
        return cursor;
      }),
      skip: chai.spy(function(skip) {
        var docs = expectedDocuments ? expectedDocuments : documents;
        expectedDocuments = docs.slice(skip);
        return cursor;
      }),
      limit: chai.spy(function(limit) {
        var docs = expectedDocuments ? expectedDocuments : documents;
        expectedDocuments = docs.slice(0, limit);
        return cursor;
      }),
      toArray: chai.spy(function(callback) {
        callback(null, expectedDocuments);
      })
    };

    // Mock MongoDB Collection
    collection = {
      countDocuments: chai.spy(function(filter, callback) {
        callback(null, documents.length);
      }),
      find: chai.spy(function() {
        return cursor;
      }),
      findOne: chai.spy(function(filter, projection, callback) {
        var docs = expectedDocuments ? expectedDocuments : documents;
        callback(docs[0] || null);
      }),
      rename: chai.spy(function(name, callback) {
        callback(null);
      })
    };

    // Mock MongoDB CommandCursor
    commandCursor = {
      toArray: chai.spy(function(callback) {
        callback();
      })
    };
  });

  // Stop mocks
  afterEach(function() {
    mock.stopAll();
  });

  describe('properties', function() {

    it('should not be editable', function() {
      var properties = ['seedlist', 'replicaSet'];
      var database = new MongoDatabase({});

      properties.forEach(function(property) {
        assert.throws(function() {
          database[property] = null;
        }, null, null, 'Expected property "' + property + '" to be unalterable');
      });

    });

  });

  describe('connect', function() {

    it('should establish a connection to the database', function(done) {
      var configuration = {
        username: 'username',
        password: 'password',
        host: '192.168.1.42',
        port: '27017',
        database: 'database',
        seedlist: 'ip:port,ip:port',
        replicaSet: 'rs'
      };
      MongoClientMock.connect = function(url, options, callback) {
        assert.ok(
          url.indexOf(
            'mongodb://' +
            configuration.username + ':' +
            configuration.password + '@' +
            configuration.host + ':' +
            configuration.port +
            ',' + configuration.seedlist +
            '/' + configuration.database +
            '?replicaSet=' + configuration.replicaSet
          ) === 0,
          'Wrong MongoDB url'
        );
        callback(null, MongoClientMock);
      };

      var database = new MongoDatabase(configuration);
      database.connect(function() {
        assert.strictEqual(database.db, expectedDatabase, 'Missing db property');
        done();
      });
    });

    it('should establish a connection to the database without replicasets', function(done) {
      var configuration = {
        username: 'username',
        password: 'password',
        host: '192.168.1.42',
        port: '27017',
        database: 'database'
      };
      MongoClientMock.connect = function(url, options, callback) {
        assert.equal(
          url,
          'mongodb://' +
          configuration.username + ':' +
          configuration.password + '@' +
          configuration.host + ':' +
          configuration.port + '/' +
          configuration.database,
          'Wrong MongoDB url'
        );
        callback(null, MongoClientMock);
      };

      var database = new MongoDatabase(configuration);
      database.connect(function(error) {
        assert.isNull(error, 'Unexpected error');
        done();
      });
    });

    it('should connect to the database without replicasets if seedlist is not specified', function(done) {
      var configuration = {
        username: 'username',
        password: 'password',
        host: '192.168.1.42',
        port: '27017',
        database: 'database',
        replicaSet: 'rs'
      };
      MongoClientMock.connect = function(url, options, callback) {
        assert.equal(
          url,
          'mongodb://' +
          configuration.username + ':' +
          configuration.password + '@' +
          configuration.host + ':' +
          configuration.port + '/' +
          configuration.database,
          'Wrong MongoDB url'
        );
        callback(null, MongoClientMock);
      };

      var database = new MongoDatabase(configuration);
      database.connect(function(error) {
        assert.isNull(error, 'Unexpected error');
        done();
      });
    });

    it('should connect to the database without replicasets if replicaSet is not specified', function(done) {
      var configuration = {
        username: 'username',
        password: 'password',
        host: '192.168.1.42',
        port: '27017',
        database: 'database',
        seedlist: 'ip:port,ip:port'
      };
      MongoClientMock.connect = function(url, options, callback) {
        assert.equal(
          url,
          'mongodb://' +
          configuration.username + ':' +
          configuration.password + '@' +
          configuration.host + ':' +
          configuration.port + '/' +
          configuration.database,
          'Wrong MongoDB url'
        );
        callback(null, MongoClientMock);
      };

      var database = new MongoDatabase(configuration);
      database.connect(function(error) {
        assert.isNull(error, 'Unexpected error');
        done();
      });
    });

    it('should execute callback with an error if connection failed', function(done) {
      var expectedError = new Error('Something went wrong');
      var configuration = {
        username: 'username',
        password: 'password',
        host: '192.168.1.42',
        port: '27017',
        database: 'database',
        seedlist: 'ip:port,ip:port'
      };
      MongoClientMock.connect = function(url, options, callback) {
        callback(expectedError);
      };

      var database = new MongoDatabase(configuration);
      database.connect(function(error) {
        assert.strictEqual(error, expectedError, 'Wrong error');
        done();
      });
    });

  });

  describe('buildFilters', function() {

    it('should transform a ResourceFilter with comparison operations into a MongoDB filter equivalent', function() {
      var filter = new ResourceFilter();
      var expectedOperations = [
        {
          field: 'field1',
          value: 'value1',
          type: ResourceFilter.OPERATORS.EQUAL,
          mongoOperator: '$eq'
        },
        {
          field: 'field1',
          value: true,
          type: ResourceFilter.OPERATORS.EXISTS,
          mongoOperator: '$exists'
        },
        {
          field: 'field2',
          value: 'value2',
          type: ResourceFilter.OPERATORS.NOT_EQUAL,
          mongoOperator: '$ne'
        },
        {
          field: 'field3',
          value: 'value3',
          type: ResourceFilter.OPERATORS.GREATER_THAN,
          mongoOperator: '$gt'
        },
        {
          field: 'field4',
          value: 'value4',
          type: ResourceFilter.OPERATORS.GREATER_THAN_EQUAL,
          mongoOperator: '$gte'
        },
        {
          field: 'field5',
          value: 'value5',
          type: ResourceFilter.OPERATORS.LESSER_THAN,
          mongoOperator: '$lt'
        },
        {
          field: 'field6',
          value: 'value6',
          type: ResourceFilter.OPERATORS.LESSER_THAN_EQUAL,
          mongoOperator: '$lte'
        },
        {
          field: 'field7',
          value: ['value7'],
          type: ResourceFilter.OPERATORS.IN,
          mongoOperator: '$in'
        },
        {
          field: 'field8',
          value: ['value8'],
          type: ResourceFilter.OPERATORS.NOT_IN,
          mongoOperator: '$nin'
        }
      ];

      expectedOperations.forEach(function(expectedOperation) {
        filter[expectedOperation.type](expectedOperation.field, expectedOperation.value);
      });

      var builtFilter = MongoDatabase.buildFilter(filter);

      expectedOperations.forEach(function(expectedOperation) {
        assert.deepEqual(
          builtFilter[expectedOperation.field][expectedOperation.mongoOperator],
          expectedOperation.value
        );
      });
    });

    it('should convert value into ObjectId when field is "_id"', function() {
      var filter = new ResourceFilter();
      var expectedOperations = [
        {
          field: '_id',
          value: 'value1',
          type: ResourceFilter.OPERATORS.EQUAL,
          mongoOperator: '$eq'
        },
        {
          field: '_id',
          value: 'value2',
          type: ResourceFilter.OPERATORS.NOT_EQUAL,
          mongoOperator: '$ne'
        },
        {
          field: '_id',
          value: ['value3'],
          type: ResourceFilter.OPERATORS.IN,
          mongoOperator: '$in'
        },
        {
          field: '_id',
          value: ['value4'],
          type: ResourceFilter.OPERATORS.NOT_IN,
          mongoOperator: '$nin'
        }
      ];

      expectedOperations.forEach(function(expectedOperation) {
        filter[expectedOperation.type](expectedOperation.field, expectedOperation.value);
      });

      var builtFilter = MongoDatabase.buildFilter(filter);

      expectedOperations.forEach(function(expectedOperation) {
        var expectedValue;

        if (expectedOperation.field === '_id') {
          var valueType = Object.prototype.toString.call(expectedOperation.value);

          if (valueType === '[object String]') {
            expectedValue = new MongoObjectIdMock(expectedOperation.value);
          } else if (valueType === '[object Array]') {
            expectedValue = expectedOperation.value.map(function(value) {
              return new MongoObjectIdMock(value);
            });
          }
        }

        assert.deepEqual(
          builtFilter[expectedOperation.field][expectedOperation.mongoOperator],
          expectedValue
        );
      });
    });

    it('should handle different comparison operations on a same field', function() {
      var filter = new ResourceFilter();
      var expectedOperations = [
        {
          field: 'field',
          value: '42',
          type: ResourceFilter.OPERATORS.EQUAL,
          mongoOperator: '$eq'
        },
        {
          field: 'field',
          value: true,
          type: ResourceFilter.OPERATORS.EXISTS,
          mongoOperator: '$exists'
        },
        {
          field: 'field',
          value: '43',
          type: ResourceFilter.OPERATORS.NOT_EQUAL,
          mongoOperator: '$ne'
        },
        {
          field: 'field',
          value: '41',
          type: ResourceFilter.OPERATORS.GREATER_THAN,
          mongoOperator: '$gt'
        },
        {
          field: 'field',
          value: '42',
          type: ResourceFilter.OPERATORS.GREATER_THAN_EQUAL,
          mongoOperator: '$gte'
        },
        {
          field: 'field',
          value: '43',
          type: ResourceFilter.OPERATORS.LESSER_THAN,
          mongoOperator: '$lt'
        },
        {
          field: 'field',
          value: '42',
          type: ResourceFilter.OPERATORS.LESSER_THAN_EQUAL,
          mongoOperator: '$lte'
        },
        {
          field: 'field',
          value: ['42'],
          type: ResourceFilter.OPERATORS.IN,
          mongoOperator: '$in'
        },
        {
          field: 'field',
          value: ['43'],
          type: ResourceFilter.OPERATORS.NOT_IN,
          mongoOperator: '$nin'
        },
        {
          field: 'field',
          value: /42/i,
          type: ResourceFilter.OPERATORS.REGEX,
          mongoOperator: '$regex'
        }
      ];

      expectedOperations.forEach(function(expectedOperation) {
        filter[expectedOperation.type](expectedOperation.field, expectedOperation.value);
      });

      var builtFilter = MongoDatabase.buildFilter(filter);

      expectedOperations.forEach(function(expectedOperation) {
        assert.equal(builtFilter[expectedOperation.field][expectedOperation.mongoOperator], expectedOperation.value);
      });
    });

    it('should transform a ResourceFilter with search operations into a MongoDB filter equivalent', function() {
      var filter = new ResourceFilter();
      var expectedValue = 'search query';

      filter.search(expectedValue);

      var builtFilter = MongoDatabase.buildFilter(filter);
      assert.equal(builtFilter.$text.$search, expectedValue, 'Wrong value');
    });

    it('should transform a ResourceFilter with logical operations into a MongoDB filter equivalent', function() {
      var filter = new ResourceFilter();
      var expectedOperations = [
        {
          filters: [
            new ResourceFilter().equal('field1', 'value1'),
            new ResourceFilter().equal('field2', 'value2')
          ],
          type: ResourceFilter.OPERATORS.OR,
          mongoOperator: '$or'
        },
        {
          filters: [
            new ResourceFilter().equal('field3', 'value3'),
            new ResourceFilter().equal('field4', 'value4')
          ],
          type: ResourceFilter.OPERATORS.NOR,
          mongoOperator: '$nor'
        },
        {
          filters: [
            new ResourceFilter().equal('field5', 'value5'),
            new ResourceFilter().equal('field6', 'value6')
          ],
          type: ResourceFilter.OPERATORS.AND,
          mongoOperator: '$and'
        }
      ];

      expectedOperations.forEach(function(expectedOperation) {
        filter[expectedOperation.type](expectedOperation.filters);
      });

      var builtFilter = MongoDatabase.buildFilter(filter);

      expectedOperations.forEach(function(expectedOperation) {
        assert.equal(
          builtFilter[expectedOperation.mongoOperator].length,
          expectedOperation.filters.length,
          'Wrong number of sub filters'
        );

        for (var i = 0; i < expectedOperation.filters.length; i++) {
          assert.deepEqual(
            builtFilter[expectedOperation.mongoOperator][i],
            MongoDatabase.buildFilter(expectedOperation.filters[i]),
            'Wrong sub filter ' + i
          );
        }
      });
    });

    it('should throw an error if a ResourceFilter operation is not implemented', function() {
      var filter = new ResourceFilter();
      filter.operations.push({
        type: 'Unkown operation type'
      });

      assert.throws(function() {
        MongoDatabase.buildFilter(filter);
      });
    });

    it('should return an empty object if no filter', function() {
      assert.isEmpty(MongoDatabase.buildFilter());
    });

  });

  describe('buildFields', function() {

    it('should build a MongoDB projection object to include fields', function() {
      var expectedFields = ['field1', 'field2'];
      var projection = MongoDatabase.buildFields(expectedFields, true);

      assert.equal(Object.keys(projection).length, expectedFields.length + 1, 'Wrong number of fields');

      for (var field in projection) {
        if (field !== '_id')
          assert.equal(projection[field], 1, 'Expected field ' + field + ' to be included');
        else
          assert.equal(projection[field], 0, 'Expected field ' + field + ' to be excluded');
      }
    });

    it('should build a MongoDB projection object to exclude from a list of fields', function() {
      var expectedFields = ['field1', 'field2'];
      var projection = MongoDatabase.buildFields(expectedFields, false);

      assert.equal(Object.keys(projection).length, expectedFields.length + 1, 'Wrong number of fields');

      for (var field in projection)
        assert.equal(projection[field], 0, 'Expected field ' + field + ' to be included');
    });

    it('should build an empty MongoDB projection object if no fields only excluding "_id" field', function() {
      var projection = MongoDatabase.buildFields(null, false);
      assert.equal(Object.keys(projection).length, 1, 'Wrong projection');
      assert.equal(projection['_id'], 0, 'Unexpected field "_id"');
    });

  });

  describe('buildSort', function() {

    it('should build a MongoDB sort object', function() {
      var expectedSort = {
        field1: 'asc',
        field2: 'desc',
        field3: 'score'
      };
      var sort = MongoDatabase.buildSort(expectedSort);

      for (var field in sort) {
        if (expectedSort[field] === 'score')
          assert.deepEqual(sort[field], {$meta: 'textScore'}, 'Wrong score sort on ' + field);
        else
          assert.equal(sort[field], expectedSort[field] === 'asc' ? 1 : -1, 'Wrong sort on ' + field);
      }
    });

  });

  describe('close', function() {

    it('should close connection to the database', function(done) {
      database.connect(function() {});
      MongoClientMock.close = function(callback) {
        callback();
      };

      database.close(function(error) {
        assert.isUndefined(error, 'Unexpected error');
        done();
      });
    });

    it('should execute callback with an error if something went wrong', function(done) {
      var expectedError = new Error('Something went wrong');

      database.connect(function() {});
      MongoClientMock.close = function(callback) {
        callback(expectedError);
      };

      database.close(function(error) {
        assert.strictEqual(error, expectedError, 'Wrong error');
        done();
      });
    });

    it('should throw an error if database connection has not been established', function() {
      assert.throws(function() {
        database.close(function() {});
      });
    });

  });

  describe('add', function() {

    it('should be able to insert documents into a collection', function(done) {
      var expectedCollection = 'collection';
      var expectedInsertedIds = {};

      expectedDocuments = [{_id: new MongoObjectIdMock('42')}];
      expectedDocuments.forEach(function(expectedDocument, index) {
        expectedInsertedIds[index] = expectedDocument._id;
      });

      collection.insertMany = chai.spy(function(results, callback) {
        assert.strictEqual(results, expectedDocuments, 'Wrong documents');
        callback(
          null, {
            insertedCount: expectedDocuments.length,
            insertedIds: expectedInsertedIds
          }
        );
      });

      database.get = chai.spy(function(collection, filter, fields, limit, page, sort, callback) {
        assert.equal(collection, expectedCollection, 'Wrong collection');
        assert.deepEqual(
          filter.getComparisonOperation(ResourceFilter.OPERATORS.IN, '_id').value,
          expectedDocuments.map(function(expectedDocument) {
            return expectedDocument._id.id;
          }),
          'Wrong get filter'
        );
        assert.isNull(fields, 'Unexpected get fields');
        assert.equal(limit, expectedDocuments.length, 'Wrong get limit');
        assert.equal(page, 0, 'Wrong get page');
        assert.isNull(sort, 'Unexpected get sort');

        callback(null, expectedDocuments);
      });

      database.add(expectedCollection, expectedDocuments, function(error, insertedCount, insertedDocuments) {
        database.db.collection.should.have.been.called.exactly(1);
        database.db.collection.should.have.been.called.with(expectedCollection);
        collection.insertMany.should.have.been.called.exactly(1);
        database.get.should.have.been.called.exactly(1);

        assert.isNull(error, 'Unexpected error');
        assert.equal(insertedCount, expectedDocuments.length, 'Wrong number of documents');
        assert.strictEqual(insertedDocuments, expectedDocuments, 'Wrong documents');

        done();
      });
    });

    it('should execute callback with an error if inserting documents failed', function(done) {
      var expectedError = new Error('Something went wrong');

      collection.insertMany = chai.spy(function(results, callback) {
        callback(expectedError);
      });

      database.add('collection', [{}], function(error) {
        collection.insertMany.should.have.been.called.exactly(1);

        assert.strictEqual(error, expectedError, 'Wrong error');
        done();
      });
    });

    it('should execute callback with an error if getting inserted documents failed', function(done) {
      var expectedError = new Error('Something went wrong');
      var expectedInsertedIds = {};

      expectedDocuments = [{_id: new MongoObjectIdMock('42')}];
      expectedDocuments.forEach(function(expectedDocument, index) {
        expectedInsertedIds[index] = expectedDocument._id;
      });

      collection.insertMany = chai.spy(function(results, callback) {
        callback(
          null, {
            insertedCount: expectedDocuments.length,
            insertedIds: expectedInsertedIds
          }
        );
      });

      database.get = chai.spy(function(collection, filter, fields, limit, page, sort, callback) {
        callback(expectedError);
      });

      database.add('collection', [{}], function(error) {
        collection.insertMany.should.have.been.called.exactly(1);
        database.get.should.have.been.called.exactly(1);

        assert.strictEqual(error, expectedError, 'Wrong error');
        done();
      });
    });

  });

  describe('remove', function() {

    it('should be able to remove documents from a collection by their ids', function(done) {
      var expectedCollection = 'collection';
      var expectedDeletedCount = 42;
      var expectedFilter = new ResourceFilter().in('id', ['42', '43']);

      collection.deleteMany = chai.spy(function(filter, callback) {
        assert.deepEqual(filter, MongoDatabase.buildFilter(expectedFilter), 'Wrong filter');
        callback(null, {deletedCount: expectedDeletedCount});
      });

      database.remove(
        expectedCollection,
        expectedFilter,
        function(error, deletedCount) {
          database.db.collection.should.have.been.called.exactly(1);
          database.db.collection.should.have.been.called.with(expectedCollection);

          assert.isNull(error, 'Unexpected error');
          assert.equal(deletedCount, expectedDeletedCount, 'Wrong number of documents');

          collection.deleteMany.should.have.been.called.exactly(1);
          done();
        }
      );
    });

    it('should execute callback with an error if removing documents failed', function(done) {
      var expectedError = new Error('Something went wrong');

      collection.deleteMany = chai.spy(function(results, callback) {
        callback(expectedError);
      });

      database.remove('collection', new ResourceFilter(), function(error) {
        collection.deleteMany.should.have.been.called.exactly(1);

        assert.strictEqual(error, expectedError, 'Wrong error');
        done();
      });
    });

  });

  describe('removeField', function() {

    it('should remove field from specified documents', function() {
      var expectedCollection = 'collection';
      var expectedProperty = 'property';
      var expectedModifiedCount = 42;
      var expectedFilter = new ResourceFilter().equal('id', '42');

      collection.updateMany = chai.spy(function(filter, data, callback) {
        expectedFilter = MongoDatabase.buildFilter(expectedFilter);
        expectedFilter[expectedProperty] = {$exists: true};

        assert.isEmpty(data.$unset[expectedProperty], 'Expected property to be empty');
        assert.deepEqual(filter, expectedFilter, 'Wrong filter');
        callback(null, {modifiedCount: expectedModifiedCount});
      });

      database.removeField(
        expectedCollection,
        expectedProperty,
        expectedFilter,
        function(error, modifiedCount) {
          database.db.collection.should.have.been.called.exactly(1);
          database.db.collection.should.have.been.called.with(expectedCollection);

          collection.updateMany.should.have.been.called.exactly(1);
          assert.isNull(error, 'Unexpected error');
          assert.equal(modifiedCount, expectedModifiedCount, 'Wrong modified count');
        }
      );

    });

    it('should execute callback with an error if removing field failed', function(done) {
      var expectedError = new Error('Something went wrong');

      collection.updateMany = chai.spy(function(filter, data, callback) {
        callback(expectedError);
      });

      database.removeField('collection', 'property', new ResourceFilter(), function(error) {
        collection.updateMany.should.have.been.called.exactly(1);

        assert.strictEqual(error, expectedError, 'Wrong error');
        done();
      });
    });

  });

  describe('updateOne', function() {

    it('should update a document', function() {
      var expectedCollection = 'collection';
      var expectedModifiedCount = 1;
      var expectedData = {};
      var expectedFilter = new ResourceFilter().equal('id', '42');

      collection.updateOne = chai.spy(function(filter, data, callback) {
        expectedFilter = MongoDatabase.buildFilter(expectedFilter);

        assert.strictEqual(data.$set, expectedData, 'Wrong data');
        assert.deepEqual(filter, expectedFilter, 'Wrong filter');
        callback(null, {modifiedCount: expectedModifiedCount});
      });

      database.updateOne(
        expectedCollection,
        expectedFilter,
        expectedData,
        function(error, modifiedCount) {
          database.db.collection.should.have.been.called.exactly(1);
          database.db.collection.should.have.been.called.with(expectedCollection);

          collection.updateOne.should.have.been.called.exactly(1);
          assert.isNull(error, 'Unexpected error');
          assert.equal(modifiedCount, expectedModifiedCount, 'Wrong modified count');
        }
      );
    });

    it('should execute callback with an error if updating the entity failed', function(done) {
      var expectedError = new Error('Something went wrong');

      collection.updateOne = chai.spy(function(filter, data, callback) {
        callback(expectedError);
      });

      database.updateOne('collection', new ResourceFilter(), {}, function(error) {
        collection.updateOne.should.have.been.called.exactly(1);

        assert.strictEqual(error, expectedError, 'Wrong error');
        done();
      });
    });

  });

  describe('get', function() {

    beforeEach(function() {
      for (var i = 0; i < 600; i++) {
        documents.push({
          id: i,
          field1: 'value1',
          field2: 'value2'
        });
      }
    });

    it('should get paginated documents', function(done) {
      var expectedCollection = 'collection';
      var expectedFilter = new ResourceFilter().equal('field', 'value');

      collection.find = chai.spy(function(filter) {
        assert.deepEqual(filter, MongoDatabase.buildFilter(expectedFilter), 'Wrong find filter');
        return cursor;
      });

      collection.countDocuments = chai.spy(function(filter, callback) {
        assert.deepEqual(filter, MongoDatabase.buildFilter(expectedFilter), 'Wrong countDocuments filter');
        callback(null, documents.length);
      });

      database.get(expectedCollection, expectedFilter, null, null, null, null, function(error, results, pagination) {
        database.db.collection.should.have.been.called.exactly(2);
        database.db.collection.should.have.been.called.with(expectedCollection);
        collection.find.should.have.been.called.exactly(1);
        cursor.project.should.have.been.called.exactly(1);
        cursor.sort.should.have.been.called.exactly(1);
        cursor.skip.should.have.been.called.exactly(1);
        cursor.limit.should.have.been.called.exactly(1);
        cursor.toArray.should.have.been.called.exactly(1);
        collection.countDocuments.should.have.been.called.exactly(1);

        assert.isNull(error, 'Unexpected error');
        assert.equal(results.length, expectedDocuments.length, 'Wrong total of documents');
        assert.equal(pagination.limit, 10, 'Wrong limit');
        assert.equal(pagination.page, 0, 'Wrong page');
        assert.equal(pagination.pages, Math.ceil(documents.length / 10), 'Wrong number of pages');
        assert.equal(pagination.size, documents.length, 'Wrong total');
        done();
      });
    });

    it('should be able to limit the number of documents per page', function(done) {
      var expectedLimit = 5;

      database.get(
        'collection',
        new ResourceFilter(),
        null,
        expectedLimit,
        null,
        null,
        function(error, results, pagination) {
          cursor.project.should.have.been.called.exactly(1);
          cursor.sort.should.have.been.called.exactly(1);
          cursor.skip.should.have.been.called.exactly(1);
          cursor.limit.should.have.been.called.exactly(1);
          cursor.toArray.should.have.been.called.exactly(1);
          collection.countDocuments.should.have.been.called.exactly(1);

          assert.isNull(error, 'Unexpected error');
          assert.equal(results.length, expectedLimit, 'Wrong number of documents');
          assert.equal(results[0].id, 0, 'Wrong documents');
          assert.equal(pagination.limit, expectedLimit, 'Wrong limit');
          assert.equal(pagination.page, 0, 'Wrong page');
          assert.equal(pagination.pages, Math.ceil(documents.length / expectedLimit), 'Wrong number of pages');
          assert.equal(pagination.size, documents.length, 'Wrong total');
          done();
        }
      );
    });

    it('should be able to select a page from the paginated documents', function(done) {
      var expectedPage = 2;

      database.get(
        'collection',
        new ResourceFilter(),
        null,
        null,
        expectedPage,
        null,
        function(error, results, pagination) {
          cursor.project.should.have.been.called.exactly(1);
          cursor.sort.should.have.been.called.exactly(1);
          cursor.skip.should.have.been.called.exactly(1);
          cursor.limit.should.have.been.called.exactly(1);
          cursor.toArray.should.have.been.called.exactly(1);
          collection.countDocuments.should.have.been.called.exactly(1);

          assert.isNull(error, 'Unexpected error');
          assert.equal(results.length, 10, 'Wrong number of documents');
          assert.equal(results[0].id, 20, 'Wrong documents');
          assert.equal(pagination.limit, 10, 'Wrong limit');
          assert.equal(pagination.page, expectedPage, 'Wrong page');
          assert.equal(pagination.pages, Math.ceil(documents.length / 10), 'Wrong number of pages');
          assert.equal(pagination.size, documents.length, 'Wrong total');
          done();
        }
      );
    });

    it('should be able to include only certain fields from documents', function(done) {
      var expectedFields = {
        include: ['field1', 'field2']
      };

      cursor.project = chai.spy(function(fields) {
        assert.deepEqual(fields, MongoDatabase.buildFields(expectedFields.include, true));
        return cursor;
      });

      database.get(
        'collection',
        new ResourceFilter(),
        expectedFields,
        null,
        null,
        null,
        function(error, results, pagination) {
          cursor.project.should.have.been.called.exactly(1);

          done();
        }
      );
    });

    it('should be able to exclude only certain fields from documents', function(done) {
      var expectedFields = {
        exclude: ['field1', 'field2']
      };

      cursor.project = chai.spy(function(fields) {
        assert.deepEqual(fields, MongoDatabase.buildFields(expectedFields.exclude, false));
        return cursor;
      });

      database.get(
        'collection',
        new ResourceFilter(),
        expectedFields,
        null,
        null,
        null,
        function(error, results, pagination) {
          cursor.project.should.have.been.called.exactly(1);

          done();
        }
      );
    });

    it('should be able to sort documents', function(done) {
      var expectedSort = {
        field1: 'asc',
        field2: 'desc'
      };

      collection.sort = chai.spy(function(sort) {
        assert.deepEqual(sort, MongoDatabase.buildSort(expectedSort), 'Wrong sort');
        return cursor;
      });

      database.get(
        'collection',
        new ResourceFilter(),
        null,
        null,
        null,
        expectedSort,
        function(error, results, pagination) {
          cursor.sort.should.have.been.called.exactly(1);

          done();
        }
      );
    });

    it('should execute callback with an error if getting documents failed', function(done) {
      var expectedError = new Error('Something went wrong');

      cursor.toArray = chai.spy(function(callback) {
        callback(expectedError);
      });

      database.get('collection', null, null, null, null, null, function(error) {
        cursor.toArray.should.have.been.called.exactly(1);

        assert.strictEqual(error, expectedError, 'Wrong error');
        done();
      });
    });

    it('should execute callback with an error if counting documents failed', function(done) {
      var expectedError = new Error('Something went wrong');

      collection.countDocuments = chai.spy(function(filter, callback) {
        callback(expectedError);
      });

      database.get('collection', null, null, null, null, null, function(error) {
        collection.countDocuments.should.have.been.called.exactly(1);

        assert.strictEqual(error, expectedError, 'Wrong error');
        done();
      });
    });

  });

  describe('getOne', function() {

    it('should get a single document', function(done) {
      var expectedCollection = 'collection';
      var expectedFilter = new ResourceFilter().equal('id', 42);
      var expectedDocuments = [{}, {}];

      collection.findOne = chai.spy(function(filter, projection, callback) {
        assert.deepEqual(filter, MongoDatabase.buildFilter(expectedFilter));
        callback(null, expectedDocuments[0]);
      });

      database.getOne('collection', expectedFilter, null, function(error, document) {
        database.db.collection.should.have.been.called.exactly(1);
        database.db.collection.should.have.been.called.with(expectedCollection);
        collection.findOne.should.have.been.called.exactly(1);

        assert.isNull(error, 'Unexpected error');
        assert.strictEqual(document, expectedDocuments[0], 'Wrong document');
        done();
      });
    });

    it('should be able to include only certain fields from document', function(done) {
      var expectedDocuments = [{}, {}];
      var expectedFields = {
        include: ['field1', 'field2']
      };

      collection.findOne = chai.spy(function(filter, projection, callback) {
        assert.deepEqual(projection, MongoDatabase.buildFields(expectedFields.include, true));
        callback(null, expectedDocuments[0]);
      });

      database.getOne('collection', null, expectedFields, function(error, document) {
        collection.findOne.should.have.been.called.exactly(1);

        assert.isNull(error, 'Unexpected error');
        done();
      });
    });

    it('should be able to exclude only certain fields from the document', function(done) {
      var expectedDocuments = [{}, {}];
      var expectedFields = {
        exclude: ['field1', 'field2']
      };

      collection.findOne = chai.spy(function(filter, projection, callback) {
        assert.deepEqual(projection, MongoDatabase.buildFields(expectedFields.exclude, false));
        callback(null, expectedDocuments[0]);
      });

      database.getOne('collection', null, expectedFields, function(error, document) {
        collection.findOne.should.have.been.called.exactly(1);

        assert.isNull(error, 'Unexpected error');
        done();
      });
    });

    it('should execute callback with an error if getting document failed', function(done) {
      var expectedError = new Error('Something went wrong');

      collection.findOne = chai.spy(function(applySkipLimit, options, callback) {
        callback(expectedError);
      });

      database.getOne('collection', null, null, function(error, document) {
        collection.findOne.should.have.been.called.exactly(1);

        assert.strictEqual(error, expectedError, 'Wrong error');
        done();
      });
    });

  });

  describe('getIndexes', function() {

    it('should get indexes of a collection', function(done) {
      var expectedCollection = 'collection';
      var expectedIndexes = {};

      collection.indexes = chai.spy(function(callback) {
        callback(null, expectedIndexes);
      });

      database.getIndexes(expectedCollection, function(error, indexes) {
        database.db.collection.should.have.been.called.exactly(1);
        database.db.collection.should.have.been.called.with(expectedCollection);
        collection.indexes.should.have.been.called.exactly(1);

        assert.isNull(error, 'Unexpected error');
        assert.strictEqual(indexes, expectedIndexes, 'Expected indexes');
        done();
      });
    });

    it('should execute callback with an error if getting indexes failed', function(done) {
      var expectedError = new Error('Something went wrong');

      collection.indexes = chai.spy(function(callback) {
        callback(expectedError);
      });

      database.getIndexes('collection', function(error) {
        collection.indexes.should.have.been.called.exactly(1);

        assert.strictEqual(error, expectedError, 'Wrong error');
        done();
      });
    });

  });

  describe('createIndexes', function() {

    it('should create indexes for a collection', function(done) {
      var expectedCollection = 'collection';
      var expectedIndexes = {};

      collection.createIndexes = chai.spy(function(indexes, callback) {
        assert.strictEqual(indexes, expectedIndexes, 'Wrong indexes');
        callback(null, expectedIndexes);
      });

      database.createIndexes(expectedCollection, expectedIndexes, function(error) {
        database.db.collection.should.have.been.called.exactly(1);
        database.db.collection.should.have.been.called.with(expectedCollection);
        collection.createIndexes.should.have.been.called.exactly(1);

        assert.isNull(error, 'Unexpected error');
        done();
      });
    });

    it('should execute callback with an error if creating indexes failed', function(done) {
      var expectedError = new Error('Something went wrong');

      collection.createIndexes = chai.spy(function(indexes, callback) {
        callback(expectedError);
      });

      database.createIndexes('collection', {}, function(error) {
        collection.createIndexes.should.have.been.called.exactly(1);

        assert.strictEqual(error, expectedError, 'Wrong error');
        done();
      });
    });

  });

  describe('dropIndex', function() {

    it('should drop index from a collection', function(done) {
      var expectedCollection = 'collection';
      var expectedIndexName = 'search';

      collection.dropIndex = chai.spy(function(indexName, callback) {
        assert.strictEqual(indexName, expectedIndexName, 'Wrong index name');
        callback(null, expectedIndexName);
      });

      database.dropIndex(expectedCollection, expectedIndexName, function(error) {
        database.db.collection.should.have.been.called.exactly(1);
        database.db.collection.should.have.been.called.with(expectedCollection);
        collection.dropIndex.should.have.been.called.exactly(1);

        assert.isNull(error, 'Unexpected error');
        done();
      });
    });

    it('should execute callback with an error if droping index failed', function(done) {
      var expectedError = new Error('Something went wrong');

      collection.dropIndex = chai.spy(function(indexName, callback) {
        callback(expectedError);
      });

      database.dropIndex('collection', {}, function(error) {
        collection.dropIndex.should.have.been.called.exactly(1);

        assert.strictEqual(error, expectedError, 'Wrong error');
        done();
      });
    });

  });

  describe('renameCollection', function() {

    it('should rename a collection', function(done) {
      var expectedName = 'collection';
      var expectedNewName = 'collection-new-name';

      database.db.listCollections = chai.spy(function(filter, options) {
        assert.deepEqual(filter, {name: expectedName}, 'Wrong listCollections filter');
        return commandCursor;
      });

      commandCursor.toArray = chai.spy(function(callback) {
        callback(null, [expectedName]);
      });

      collection.rename = chai.spy(function(name, callback) {
        assert.equal(name, expectedNewName, 'Wrong name');
        callback(null);
      });

      database.renameCollection(expectedName, expectedNewName, function(error) {
        database.db.listCollections.should.have.been.called.exactly(1);
        database.db.collection.should.have.been.called.exactly(1);
        commandCursor.toArray.should.have.been.called.exactly(1);
        collection.rename.should.have.been.called.exactly(1);

        assert.isNull(error, 'Unexpected error');
        done();
      });
    });

    it('should execute callback with an error if collection is not found', function(done) {
      commandCursor.toArray = chai.spy(function(callback) {
        callback(null, []);
      });

      database.renameCollection('collection', 'new-name', function(error) {
        database.db.listCollections.should.have.been.called.exactly(1);
        collection.rename.should.have.been.called.exactly(0);

        assert.strictEqual(error.code, databaseErrors.RENAME_COLLECTION_NOT_FOUND_ERROR, 'Wrong error');
        done();
      });
    });

    it('should execute callback with an error if fetching collections failed', function(done) {
      var expectedError = new Error('Something went wrong');

      commandCursor.toArray = chai.spy(function(callback) {
        callback(expectedError);
      });

      database.renameCollection('collection', 'new-name', function(error) {
        database.db.listCollections.should.have.been.called.exactly(1);
        commandCursor.toArray.should.have.been.called.exactly(1);
        collection.rename.should.have.been.called.exactly(0);

        assert.strictEqual(error, expectedError, 'Wrong error');
        done();
      });
    });

    it('should execute callback with an error if renaming collection failed', function(done) {
      var expectedError = new Error('Something went wrong');

      commandCursor.toArray = chai.spy(function(callback) {
        callback(null, ['collection']);
      });

      collection.rename = chai.spy(function(name, callback) {
        callback(expectedError);
      });

      database.renameCollection('collection', 'new-name', function(error) {
        collection.rename.should.have.been.called.exactly(1);

        assert.strictEqual(error, expectedError, 'Wrong error');
        done();
      });
    });

  });

  describe('removeCollection', function() {

    it('should remove a collection', function() {
      var expectedCollection = 'collection';

      database.db.listCollections = chai.spy(function(filter, options) {
        assert.deepEqual(filter, {name: expectedCollection}, 'Wrong listCollections filter');
        return commandCursor;
      });

      database.db.dropCollection = chai.spy(function(name, callback) {
        assert.equal(name, expectedCollection, 'Wrong name');
        callback(null);
      });

      commandCursor.toArray = chai.spy(function(callback) {
        callback(null, [expectedCollection]);
      });

      database.removeCollection(expectedCollection, function(error) {
        database.db.listCollections.should.have.been.called.exactly(1);
        commandCursor.toArray.should.have.been.called.exactly(1);
        database.db.dropCollection.should.have.been.called.exactly(1);

        assert.isNull(error, 'Unexpected error');
      });
    });

    it('should execute callback with an error if removing collection failed', function(done) {
      var expectedError = new Error('Something went wrong');
      var expectedCollection = 'collection';

      database.db.dropCollection = chai.spy(function(name, callback) {
        callback(expectedError);
      });

      commandCursor.toArray = chai.spy(function(callback) {
        callback(null, [expectedCollection]);
      });

      database.removeCollection(expectedCollection, function(error) {
        commandCursor.toArray.should.have.been.called.exactly(1);
        database.db.dropCollection.should.have.been.called.exactly(1);

        assert.strictEqual(error, expectedError, 'Wrong error');
        done();
      });
    });

    it('should execute callback with a storage error if collection is not found', function(done) {
      database.removeCollection('Unknown collection', function(error) {
        database.db.listCollections.should.have.been.called.exactly(1);
        commandCursor.toArray.should.have.been.called.exactly(1);
        database.db.dropCollection.should.have.been.called.exactly(0);

        assert.strictEqual(error.code, databaseErrors.REMOVE_COLLECTION_NOT_FOUND_ERROR, 'Wrong error');
        done();
      });
    });

  });

});
