'use strict';

/**
 * @module storages
 */

var util = require('util');
var mongodb = require('mongodb');
var session = require('express-session');
var MongoStore = require('connect-mongo')(session);
var Database = process.requireApi('lib/storages/databases/Database.js');
var databaseErrors = process.requireApi('lib/storages/databases/databaseErrors.js');
var ResourceFilter = process.requireApi('lib/storages/ResourceFilter.js');
var StorageError = process.requireApi('lib/errors/StorageError.js');
var MongoClient = mongodb.MongoClient;

/**
 * Defines a MongoDB Database.
 *
 * @class MongoDatabase
 * @extends Database
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

  Object.defineProperties(this, {

    /**
     * The name of the replica set.
     *
     * @property replicaSet
     * @type String
     * @final
     */
    replicaSet: {value: configuration.replicaSet},

    /**
     * A comma separated list of secondary servers.
     *
     * @property seedlist
     * @type String
     * @final
     */
    seedlist: {value: configuration.seedlist},

    /**
     * The connected database.
     *
     * @property database
     * @type Db
     * @final
     */
    db: {
      value: null,
      writable: true
    }

  });
}

module.exports = MongoDatabase;
util.inherits(MongoDatabase, Database);

/**
 * Builds MongoDb filter from a ResourceFilter.
 *
 * @method buildFilter
 * @static
 * @param {ResourceFilter} resourceFilter The common resource filter
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
 * @method buildFields
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
 * @method buildSort
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
 * @method connect
 * @async
 * @param {Function} callback The function to call when connection to the database is established
 *   - **Error** The error if an error occurred, null otherwise
 */
MongoDatabase.prototype.connect = function(callback) {
  var self = this;
  var connectionUrl = 'mongodb://' + this.username + ':' + this.password + '@' + this.host + ':' + this.port;
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

  MongoClient.connect(connectionUrl, function(error, db) {

    // Connection succeeded
    if (!error)
      self.db = db;

    callback(error);
  });

};

/**
 * Closes connection to the database.
 *
 * @method close
 * @async
 * @param {Function} callback The function to call when connection is closed
 *   - **Error** The error if an error occurred, null otherwise
 */
MongoDatabase.prototype.close = function(callback) {
  this.db.close(callback);
};

/**
 * Inserts several documents into a collection.
 *
 * @method add
 * @async
 * @param {String} collection The collection to work on
 * @param {Array} documents Document(s) to insert into the collection
 * @param {Function} callback The function to call when it's done
 *   - **Error** The error if an error occurred, null otherwise
 *   - **Number** The total amount of documents inserted
 *   - **Array** The list of inserted documents
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
 * @method remove
 * @async
 * @param {String} collection The collection to work on
 * @param {ResourceFilter} [filter] Rules to filter documents to remove
 * @param {Function} callback The function to call when it's done
 *   - **Error** The error if an error occurred, null otherwise
 *   - **Number** The number of deleted documents
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
 * @method removeField
 * @async
 * @param {String} collection The collection to work on
 * @param {String} property The name of the property to remove
 * @param {ResourceFilter} [filter] Rules to filter documents to update
 * @param {Function} callback The function to call when it's done
 *   - **Error** The error if an error occurred, null otherwise
 *   - **Number** The number of updated documents
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
 * @method updateOne
 * @async
 * @param {String} collection The collection to work on
 * @param {ResourceFilter} [filter] Rules to filter the document to update
 * @param {Object} data The modifications to perform
 * @param {Function} callback The function to call when it's done
 *   - **Error** The error if an error occurred, null otherwise
 *   - **Number** 1 if everything went fine
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
 * @method get
 * @async
 * @param {String} collection The collection to work on
 * @param {ResourceFilter} [filter] Rules to filter documents
 * @param {Object} [fields] Expected resource fields to be included or excluded from the response, by default all
 * fields are returned. Only "exclude" or "include" can be specified, not both
 * @param {Array} [fields.include] The list of fields to include in the response, all other fields are excluded
 * @param {Array} [fields.exclude] The list of fields to exclude from response, all other fields are included. Ignored
 * if include is also specified.
 * @param {Number} [limit] A limit number of documents to retrieve (10 by default)
 * @param {Number} [page] The page number started at 0 for the first page
 * @param {Object} sort The list of fields to sort by with the field name as key and the sort order as
 * value (e.g. {field1: 'asc', field2: 'desc', field3: 'score'})
 * @param {Function} callback The function to call when it's done
 *   - **Error** The error if an error occurred, null otherwise
 *   - **Array** The list of retrieved documents
 *   - **Object** Pagination information
 *     - **Number** limit The specified limit
 *     - **Number** page The actual page
 *     - **Number** pages The total number of pages
 *     - **Number** size The total number of documents
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
 * @method getOne
 * @async
 * @param {String} collection The collection to work on
 * @param {ResourceFilter} [filter] Rules to filter documents
 * @param {Object} [fields] Expected document fields to be included or excluded from the response, by default all
 * fields are returned. Only "exclude" or "include" can be specified, not both
 * @param {Array} [fields.include] The list of fields to include in the response, all other fields are excluded
 * @param {Array} [fields.exclude] The list of fields to exclude from response, all other fields are included. Ignored
 * if include is also specified.
 * @param {Function} callback The function to call when it's done
 *   - **Error** The error if an error occurred, null otherwise
 *   - **Object** The document
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
 * @method getIndexes
 * @async
 * @param {String} collection The collection to work on
 * @param {Function} callback The function to call when it's done
 *   - **Error** The error if an error occurred, null otherwise
 *   - **Array** The list of indexes
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
 * @method createIndexes
 * @async
 * @param {String} collection The collection to work on
 * @param {Array} indexes A list of indexes using MongoDB format
 * @param {Function} callback The function to call when it's done
 *   - **Error** The error if an error occurred, null otherwise
 *   - **Object** Information about the operation
 */
MongoDatabase.prototype.createIndexes = function(collection, indexes, callback) {
  this.db.collection(collection, function(error, fetchedCollection) {
    if (error)
      return callback(error);

    fetchedCollection.createIndexes(indexes, callback);
  });
};

/**
 * Gets an express-session store for this database.
 *
 * @method getStore
 * @param {String} collection The collection to work on
 * @return {Store} An express-session store
 */
MongoDatabase.prototype.getStore = function(collection) {
  return new MongoStore({db: this.db, collection: collection});
};

/**
 * Renames a collection.
 *
 * @method renameCollection
 * @async
 * @param {String} collection The collection to work on
 * @param {String} target The new name of the collection
 * @param {Function} callback The function to call when it's done
 *   - **Error** The error if an error occurred, null otherwise
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
 * @method removeCollection
 * @async
 * @param {String} collection The collection to work on
 * @param {Function} callback The function to call when it's done
 *   - **Error** The error if an error occurred, null otherwise
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
