'use strict';

/**
 * @module storages/MongoDatabase
 */

var util = require('util');
var mongodb = require('mongodb');
var MongoStore = require('connect-mongo');
var Database = process.requireApi('lib/storages/databases/Database.js');
var databaseErrors = process.requireApi('lib/storages/databases/databaseErrors.js');
var ResourceFilter = process.requireApi('lib/storages/ResourceFilter.js');
var StorageError = process.requireApi('lib/errors/StorageError.js');
var MongoClient = mongodb.MongoClient;

/**
 * Defines a MongoDB Database.
 *
 * @class MongoDatabase
 * @extends module:storages/Database~Database
 * @constructor
 * @param {Object} configuration A database configuration object
 * @param {String} configuration.host MongoDB server host
 * @param {Number} configuration.port MongoDB server port
 * @param {String} configuration.database The name of the database
 * @param {String} configuration.username The name of the database user
 * @param {String} configuration.password The password of the database user
 * @param {String} [configuration.replicaSet] The name of the ReplicaSet
 * @param {String} [configuration.seedlist] The comma separated list of secondary servers
 */
function MongoDatabase(configuration) {
  MongoDatabase.super_.call(this, configuration);

  Object.defineProperties(this,

    /** @lends module:storages/MongoDatabase~MongoDatabase */
    {

      /**
       * The name of the replica set.
       *
       * @type {String}
       * @instance
       * @readonly
       */
      replicaSet: {value: configuration.replicaSet},

      /**
       * A comma separated list of secondary servers.
       *
       * @type {String}
       * @instance
       * @readonly
       */
      seedlist: {value: configuration.seedlist},

      /**
       * The connected database.
       *
       * @type {Object}
       * @instance
       * @readonly
       */
      db: {
        value: null,
        writable: true
      },

      /**
       * The MongoDB client instance.
       *
       * @type {Object}
       * @instance
       */
      client: {
        value: null,
        writable: true
      }

    }

  );
}

module.exports = MongoDatabase;
util.inherits(MongoDatabase, Database);

/**
 * Builds MongoDb filter from a ResourceFilter.
 *
 * @static
 * @param {module:storages/ResourceFilter~ResourceFilter} resourceFilter The common resource filter
 * @return {Object} The MongoDB like filter description object
 * @throws {TypeError} If an operation is not supported
 */
MongoDatabase.buildFilter = function(resourceFilter) {
  var filter = {};

  if (!resourceFilter) return filter;

  /**
   * Builds a list of filters.
   *
   * @param {Array} filters The list of filters to build
   * @return {Array} The list of built filters
   */
  function buildFilters(filters) {
    var builtFilters = [];
    filters.forEach(function(filter) {
      builtFilters.push(MongoDatabase.buildFilter(filter));
    });
    return builtFilters;
  }

  resourceFilter.operations.forEach(function(operation) {
    switch (operation.type) {
      case ResourceFilter.OPERATORS.EQUAL:
        if (!filter[operation.field]) filter[operation.field] = {};
        filter[operation.field]['$eq'] = operation.value;
        break;
      case ResourceFilter.OPERATORS.NOT_EQUAL:
        if (!filter[operation.field]) filter[operation.field] = {};
        filter[operation.field]['$ne'] = operation.value;
        break;
      case ResourceFilter.OPERATORS.GREATER_THAN:
        if (!filter[operation.field]) filter[operation.field] = {};
        filter[operation.field]['$gt'] = operation.value;
        break;
      case ResourceFilter.OPERATORS.GREATER_THAN_EQUAL:
        if (!filter[operation.field]) filter[operation.field] = {};
        filter[operation.field]['$gte'] = operation.value;
        break;
      case ResourceFilter.OPERATORS.LESSER_THAN:
        if (!filter[operation.field]) filter[operation.field] = {};
        filter[operation.field]['$lt'] = operation.value;
        break;
      case ResourceFilter.OPERATORS.LESSER_THAN_EQUAL:
        if (!filter[operation.field]) filter[operation.field] = {};
        filter[operation.field]['$lte'] = operation.value;
        break;
      case ResourceFilter.OPERATORS.IN:
        if (!filter[operation.field]) filter[operation.field] = {};
        filter[operation.field]['$in'] = operation.value;
        break;
      case ResourceFilter.OPERATORS.NOT_IN:
        if (!filter[operation.field]) filter[operation.field] = {};
        filter[operation.field]['$nin'] = operation.value;
        break;
      case ResourceFilter.OPERATORS.REGEX:
        if (!filter[operation.field]) filter[operation.field] = {};
        filter[operation.field]['$regex'] = operation.value;
        break;
      case ResourceFilter.OPERATORS.AND:
        filter['$and'] = buildFilters(operation.filters);
        break;
      case ResourceFilter.OPERATORS.OR:
        filter['$or'] = buildFilters(operation.filters);
        break;
      case ResourceFilter.OPERATORS.NOR:
        filter['$nor'] = buildFilters(operation.filters);
        break;
      case ResourceFilter.OPERATORS.SEARCH:
        filter['$text'] = {
          $search: operation.value
        };
        break;
      default:
        throw new StorageError(
          'Operation ' + operation.type + ' not supported',
          databaseErrors.BUILD_FILTERS_UNKNOWN_OPERATION_ERROR
        );
    }
  });

  return filter;
};

/**
 * Builds MongoDb fields projection.
 *
 * @static
 * @param {Array} fields The list of fields to include or exclude
 * @param {Boolean} doesInclude true to include fields and exclude all other fields or false to exclude fields and
 * include all other fields
 * @return {Object} The MongoDB projection description object
 */
MongoDatabase.buildFields = function(fields, doesInclude) {
  var projection = {_id: 0};

  if (!fields) return projection;

  fields.forEach(function(field) {
    projection[field] = doesInclude ? 1 : 0;
  });

  return projection;
};

/**
 * Builds MongoDB sort object.
 *
 * Concretely it just replaces "score" by "{ $meta: 'textScore' }", "asc" by 1 and "desc" by -1.
 *
 * @static
 * @param {Object} [sort] The list of fields to sort by with the field name as key and the sort order as
 * value (e.g. {field1: 'asc', field2: 'desc', field3: 'score'})
 * @return {Object} The MongoDB sort description object
 */
MongoDatabase.buildSort = function(sort) {
  var mongoSort = {};

  if (!sort) return mongoSort;
  for (var field in sort) {
    if (sort[field] === 'score') mongoSort[field] = {$meta: 'textScore'};
    else mongoSort[field] = sort[field] === 'asc' ? 1 : -1;
  }

  return mongoSort;
};

/**
 * Establishes connection to the database.
 *
 * @param {callback} callback The function to call when connection to the database is established
 */
MongoDatabase.prototype.connect = function(callback) {
  var self = this;
  var name = encodeURIComponent(this.username);
  var password = encodeURIComponent(this.password);
  var connectionUrl = 'mongodb://' + name + ':' + password + '@' + this.host + ':' + this.port;
  var database = '/' + this.name;
  var seedlist = ',' + this.seedlist;
  var replicaset = '?replicaSet=' + this.replicaSet + '&readPreference=secondary';

  // Connect to a Replica Set or not
  if (this.seedlist != undefined &&
      this.seedlist != '' &&
      this.replicaSet != undefined &&
      this.replicaSet != '') {
    connectionUrl = connectionUrl + seedlist + database + replicaset;
  } else
    connectionUrl = connectionUrl + database;

  MongoClient.connect(
    connectionUrl, {
      useUnifiedTopology: true,
      useNewUrlParser: true
    }, function(error, client) {

      // Connection succeeded
      if (!error) {
        self.client = client;
        self.db = client.db(self.name);
      }

      callback(error);
    }
  );
};

/**
 * Closes connection to the database.
 *
 * @param {callback} callback The function to call when connection is closed
 */
MongoDatabase.prototype.close = function(callback) {
  this.client.close(callback);
};

/**
 * Inserts several documents into a collection.
 *
 * @param {String} collection The collection to work on
 * @param {Array} documents Document(s) to insert into the collection
 * @param {module:storages/MongoDatabase~MongoDatabase~addCallback} callback The function to call when it's done
 */
MongoDatabase.prototype.add = function(collection, documents, callback) {
  this.db.collection(collection, function(error, fetchedCollection) {
    if (error)
      return callback(error);

    fetchedCollection.insertMany(documents, function(error, result) {
      if (error)
        callback(error);
      else
        callback(null, result.insertedCount, result.ops);
    });
  });
};

/**
 * Removes several documents from a collection.
 *
 * @param {String} collection The collection to work on
 * @param {module:storages/ResourceFilter~ResourceFilter} [filter] Rules to filter documents to remove
 * @param {module:storages/MongoDatabase~MongoDatabase~removeCallback} callback The function to call when it's done
 */
MongoDatabase.prototype.remove = function(collection, filter, callback) {
  filter = MongoDatabase.buildFilter(filter);

  this.db.collection(collection, function(error, fetchedCollection) {
    if (error)
      return callback(error);

    fetchedCollection.deleteMany(filter, function(error, result) {
      if (error)
        callback(error);
      else
        callback(null, result.deletedCount);
    });
  });
};

/**
 * Removes a property from documents of a collection.
 *
 * @param {String} collection The collection to work on
 * @param {String} property The name of the property to remove
 * @param {module:storages/ResourceFilter~ResourceFilter} [filter] Rules to filter documents to update
 * @param {module:storages/MongoDatabase~MongoDatabase~removeFieldCallback} callback The function to call when it's done
 */
MongoDatabase.prototype.removeField = function(collection, property, filter, callback) {
  filter = MongoDatabase.buildFilter(filter);
  filter[property] = {$exists: true};

  var update = {};
  update['$unset'] = {};
  update['$unset'][property] = '';

  this.db.collection(collection, function(error, fetchedCollection) {
    if (error)
      return callback(error);

    fetchedCollection.updateMany(filter, update, function(error, result) {
      if (error)
        callback(error);
      else
        callback(null, result.modifiedCount);
    });
  });
};

/**
 * Updates a document from collection.
 *
 * @param {String} collection The collection to work on
 * @param {module:storages/ResourceFilter~ResourceFilter} [filter] Rules to filter the document to update
 * @param {Object} data The modifications to perform
 * @param {module:storages/MongoDatabase~MongoDatabase~updateOneCallback} callback The function to call when it's done
 */
MongoDatabase.prototype.updateOne = function(collection, filter, data, callback) {
  var update = {$set: data};
  filter = MongoDatabase.buildFilter(filter);

  this.db.collection(collection, function(error, fetchedCollection) {
    if (error) return callback(error);

    fetchedCollection.updateOne(filter, update, function(error, result) {
      if (error)
        callback(error);
      else
        callback(null, result.modifiedCount);
    });
  });
};

/**
 * Fetches documents from the collection.
 *
 * @param {String} collection The collection to work on
 * @param {module:storages/ResourceFilter~ResourceFilter} [filter] Rules to filter documents
 * @param {Object} [fields] Expected resource fields to be included or excluded from the response, by default all
 * fields are returned. Only "exclude" or "include" can be specified, not both
 * @param {Array} [fields.include] The list of fields to include in the response, all other fields are excluded
 * @param {Array} [fields.exclude] The list of fields to exclude from response, all other fields are included. Ignored
 * if include is also specified.
 * @param {Number} [limit] A limit number of documents to retrieve (10 by default)
 * @param {Number} [page] The page number started at 0 for the first page
 * @param {Object} sort The list of fields to sort by with the field name as key and the sort order as
 * value (e.g. {field1: 'asc', field2: 'desc', field3: 'score'})
 * @param {module:storages/MongoDatabase~MongoDatabase~getCallback} callback The function to call when it's done
 */
MongoDatabase.prototype.get = function(collection, filter, fields, limit, page, sort, callback) {
  this.db.collection(collection, function(error, fetchedCollection) {
    if (error) return callback(error);

    limit = limit || 10;
    fields = fields || {};
    page = page || 0;
    filter = MongoDatabase.buildFilter(filter);
    sort = MongoDatabase.buildSort(sort);
    var projection = MongoDatabase.buildFields(fields.include || fields.exclude, fields.include ? true : false);
    var skip = limit * page || 0;

    // Automatically add the textScore projection if sorting by textScore
    for (var field in sort) {
      if (Object.prototype.hasOwnProperty.call(sort[field], '$meta') && sort[field].$meta === 'textScore') {
        projection[field] = sort[field];
        break;
      }
    }

    var cursor = fetchedCollection.find(filter).project(projection).sort(sort).skip(skip).limit(limit);
    cursor.toArray(function(toArrayError, documents) {
      if (toArrayError) return callback(toArrayError);

      cursor.count(false, null, function(countError, count) {
        if (countError) callback(countError);

        callback(error, documents || [], {
          limit: limit,
          page: page,
          pages: Math.ceil(count / limit),
          size: count
        });
      });
    });

  });
};

/**
 * Fetches a single document from the storage.
 *
 * @param {String} collection The collection to work on
 * @param {module:storages/ResourceFilter~ResourceFilter} [filter] Rules to filter documents
 * @param {Object} [fields] Expected document fields to be included or excluded from the response, by default all
 * fields are returned. Only "exclude" or "include" can be specified, not both
 * @param {Array} [fields.include] The list of fields to include in the response, all other fields are excluded
 * @param {Array} [fields.exclude] The list of fields to exclude from response, all other fields are included. Ignored
 * if include is also specified.
 * @param {module:storages/MongoDatabase~MongoDatabase~getOneCallback} callback The function to call when it's done
 */
MongoDatabase.prototype.getOne = function(collection, filter, fields, callback) {
  filter = MongoDatabase.buildFilter(filter);
  fields = fields || {};
  var projection = MongoDatabase.buildFields(fields.include || fields.exclude, fields.include ? true : false);

  this.db.collection(collection, function(error, fetchedCollection) {
    if (error) return callback(error);
    fetchedCollection.findOne(filter, projection, callback);
  });
};

/**
 * Gets the list of indexes for a collection.
 *
 * @param {String} collection The collection to work on
 * @param {module:storages/MongoDatabase~MongoDatabase~getIndexesCallback} callback The function to call when it's done
 */
MongoDatabase.prototype.getIndexes = function(collection, callback) {
  this.db.collection(collection, function(error, fetchedCollection) {
    if (error)
      return callback(error);

    fetchedCollection.indexes(callback);
  });
};

/**
 * Creates indexes for a collection.
 *
 * @param {String} collection The collection to work on
 * @param {Array} indexes A list of indexes using MongoDB format
 * @param {module:storages/MongoDatabase~MongoDatabase~createIndexesCallback} callback The function to call when it's
 * done
 */
MongoDatabase.prototype.createIndexes = function(collection, indexes, callback) {
  this.db.collection(collection, function(error, fetchedCollection) {
    if (error)
      return callback(error);

    fetchedCollection.createIndexes(indexes, callback);
  });
};

/**
 * Drops an index from a collection.
 *
 * @param {String} collection The collection to work on
 * @param {Array} indexName The name of the index to drop
 * @param {module:storages/MongoDatabase~MongoDatabase~dropIndexCallback} callback The function to call when it's done
 */
MongoDatabase.prototype.dropIndex = function(collection, indexName, callback) {
  this.db.collection(collection, function(error, fetchedCollection) {
    if (error)
      return callback(error);

    fetchedCollection.dropIndex(indexName, callback);
  });
};

/**
 * Gets an express-session store for this database.
 *
 * @param {String} collection The collection to work on
 * @return {Object} An express-session store
 */
MongoDatabase.prototype.getStore = function(collection) {
  return new MongoStore({client: this.client, collectionName: collection});
};

/**
 * Renames a collection.
 *
 * @param {String} collection The collection to work on
 * @param {String} target The new name of the collection
 * @param {callback} callback The function to call when it's done
 */
MongoDatabase.prototype.renameCollection = function(collection, target, callback) {
  var self = this;

  this.db.listCollections({name: collection}).toArray(function(error, collections) {
    if (error) return callback(error);
    if (!collections || !collections.length) {
      return callback(
        new StorageError('Collection "' + collection + '" not found', databaseErrors.RENAME_COLLECTION_NOT_FOUND_ERROR)
      );
    }

    self.db.collection(collection, function(error, fetchedCollection) {
      if (error) return callback(error);

      fetchedCollection.rename(target, function(error) {
        callback(error);
      });
    });
  });
};

/**
 * Removes a collection from the database.
 *
 * @param {String} collection The collection to work on
 * @param {callback} callback The function to call when it's done
 */
MongoDatabase.prototype.removeCollection = function(collection, callback) {
  this.db.listCollections({name: collection}).toArray(function(error, collections) {
    if (error) return callback(error);
    if (!collections || !collections.length) {
      return callback(
        new StorageError('Collection "' + collection + '" not found', databaseErrors.REMOVE_COLLECTION_NOT_FOUND_ERROR)
      );
    }

    this.db.dropCollection(collection, callback);
  }.bind(this));
};

/**
 * @callback module:storages/MongoDatabase~MongoDatabase~addCallback
 * @param {(Error|null)} error The error if an error occurred, null otherwise
 * @param {(Number|Undefined)} total The total amount of documents inserted
 * @param {(Array|Undefined)} documents The list of inserted documents
 */

/**
 * @callback module:storages/MongoDatabase~MongoDatabase~removeCallback
 * @param {(Error|null)} error The error if an error occurred, null otherwise
 * @param {(Number|Undefined)} total The number of deleted documents
 */

/**
 * @callback module:storages/MongoDatabase~MongoDatabase~removeFieldCallback
 * @param {(Error|null)} error The error if an error occurred, null otherwise
 * @param {(Number|Undefined)} total The number of updated documents
 */

/**
 * @callback module:storages/MongoDatabase~MongoDatabase~updateOneCallback
 * @param {(Error|null)} error The error if an error occurred, null otherwise
 * @param {(Number|Undefined)} total 1 if everything went fine
 */

/**
 * @callback module:storages/MongoDatabase~MongoDatabase~getCallback
 * @param {(Error|null)} error The error if an error occurred, null otherwise
 * @param {(Array|Undefined)} documents The list of retrieved documents
 * @param {(Object|Undefined)} pagination Pagination information
 * @param {(Number|Undefined)} limit The specified limit
 * @param {(Number|Undefined)} page The actual page
 * @param {(Number|Undefined)} pages The total number of pages
 * @param {(Number|Undefined)} size The total number of documents
 */

/**
 * @callback module:storages/MongoDatabase~MongoDatabase~getOneCallback
 * @param {(Error|null)} error The error if an error occurred, null otherwise
 * @param {(Object|Undefined)} document The document
 */

/**
 * @callback module:storages/MongoDatabase~MongoDatabase~getIndexesCallback
 * @param {(Error|null)} error The error if an error occurred, null otherwise
 * @param {(Array|Undefined)} indexes The list of indexes
 */

/**
 * @callback module:storages/MongoDatabase~MongoDatabase~createIndexesCallback
 * @param {(Error|null)} error The error if an error occurred, null otherwise
 * @param {(Object|Undefined)} result Information about the operation
 */

/**
 * @callback module:storages/MongoDatabase~MongoDatabase~dropIndexCallback
 * @param {(Error|null)} error The error if an error occurred, null otherwise
 * @param {(Object|Undefined)} result Information about the operation
 */
