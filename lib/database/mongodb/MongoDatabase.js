'use strict';

/**
 * @module mongodb
 */

var util = require('util');
var mongodb = require('mongodb');
var session = require('express-session');
var MongoStore = require('connect-mongo')(session);
var Database = process.requireAPI('lib/Database.js');
var utilExt = process.requireAPI('lib/util.js');
var MongoClient = mongodb.MongoClient;

/**
 * Defines a MongoDB Database.
 *
 * MongoDatabase must not be used directly. Use Database to get an instance of MongoDatabase.
 *
 * @example
 *
 *     var api = require('@openveo/api');
 *
 *     // Example of a MongoDB database configuration object
 *     var databaseConf = {
 *       "type" : "mongodb", // Database type
 *       "host" : "localhost", // MongoDB server host
 *       "port" : 27017, // MongoDB port
 *       "database" : "DATABASE_NAME", // Replace DATABASE_NAME by the name of the OpenVeo database
 *       "username" : "DATABASE_USER_NAME", // Replace DATABASE_USER_NAME by the name of the database user
 *       "password" : "DATABASE_USER_PWD", // Replace DATABASE_USER_PWD  by the password of the database user
 *       "replicaSet" : "REPLICA_SET_NAME", // Replace REPLICA_SET_NAME by the name of the ReplicaSet
 *       "seedlist": "IP_1:PORT_1,IP_2:PORT_2" // The comma separated list of secondary servers
 *     };
 *
 *     // Get a MongoDB database instance
 *     var db = api.Database.getDatabase(databaseConf);
 *
 * @class MongoDatabase
 * @extends Database
 * @constructor
 * @param Object databaseConf A database configuration object
 */
function MongoDatabase(databaseConf) {
  Database.call(this, databaseConf);
}

module.exports = MongoDatabase;
util.inherits(MongoDatabase, Database);

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
  var connectionUrl = 'mongodb://' + this.conf.username + ':' + this.conf.password + '@' + this.conf.host + ':' + this.conf.port;
  var database = '/' + this.conf.database;
  var seedlist = ',' + this.conf.seedlist;
  var replicaset = '?replicaSet=' + this.conf.replicaSet + '&readPreference=secondary';

  // Connect to a Replica Set or not
  if (this.conf.seedlist != undefined &&
      this.conf.seedlist != '' &&
      this.conf.replicaSet != undefined &&
      this.conf.replicaSet != '') {
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
 * @method insert
 * @async
 * @param {String} collection The collection to work on
 * @param {Array} data Document(s) to insert into the collection
 * @param {Function} callback The function to call when it's done
 *   - **Error** The error if an error occurred, null otherwise
 *   - **Number** The total amount of documents inserted
 *   - **Array** All the documents inserted
 */
MongoDatabase.prototype.insert = function(collection, data, callback) {
  this.db.collection(collection, function(error, fetchedCollection) {
    if (error)
      return callback(error);

    fetchedCollection.insertMany(data, function(error, result) {
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
 * @param {Object} filter Filters formatted like MongoDB filters
 * @param {Function} callback The function to call when it's done
 *   - **Error** The error if an error occurred, null otherwise
 *   - **Number** The number of deleted documents
 */
MongoDatabase.prototype.remove = function(collection, filter, callback) {
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
 * Removes a property on all documents in the collection.
 *
 * @method removeProp
 * @async
 * @param {String} collection The collection to work on
 * @param {String} property The property name to remove
 * @param {Object} filter Filters formatted like MongoDB filters
 * @param {Function} callback The function to call when it's done
 *   - **Error** The error if an error occurred, null otherwise
 *   - **Number** The number of updated documents
 */
MongoDatabase.prototype.removeProp = function(collection, property, filter, callback) {
  var mongoFilter = {};
  mongoFilter[property] = {$exists: true};
  mongoFilter = utilExt.merge(mongoFilter, filter);

  var update = {};
  update['$unset'] = {};
  update['$unset'][property] = '';

  this.db.collection(collection, function(error, fetchedCollection) {
    if (error)
      return callback(error);

    fetchedCollection.updateMany(mongoFilter, update, function(error, result) {
      if (error)
        callback(error);
      else
        callback(null, result.modifiedCount);
    });
  });
};

/**
 * Updates several documents from collection.
 *
 * @method update
 * @async
 * @param {String} collection The collection to work on
 * @param {Object} filter Filters formatted like MongoDB filters
 * @param {Object} data Document data
 * @param {Function} callback The function to call when it's done
 *   - **Error** The error if an error occurred, null otherwise
 *   - **Number** The number of updated documents
 */
MongoDatabase.prototype.update = function(collection, filter, data, callback) {
  var update = {$set: data};

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
 * Gets a list of documents.
 *
 * @method get
 * @async
 * @param {String} collection The collection to work on
 * @param {Object} [criteria] MongoDB criterias
 * @param {Object} [projection] MongoDB projection
 * @param {Number} [limit] A limit number of items to retrieve (all by default)
 * @param {Function} callback The function to call when it's done
 *   - **Error** The error if an error occurred, null otherwise
 *   - **Array** The retrieved documents
 */
MongoDatabase.prototype.get = function(collection, criteria, projection, limit, callback) {
  this.db.collection(collection, function(error, fetchedCollection) {
    if (error)
      return callback(error);

    criteria = criteria || {};
    projection = projection || {};
    limit = limit || -1;

    if (limit === -1)
      fetchedCollection.find(criteria, projection).toArray(callback);
    else
      fetchedCollection.find(criteria, projection).limit(limit).toArray(callback);
  });
};

/**
 * Gets an ordered list of documents by page.
 *
 * @method search
 * @async
 * @param {String} collection The collection to work on
 * @param {Object} [criteria] MongoDB criterias
 * @param {Object} [projection] MongoDB projection
 * @param {Number} [limit] The maximum number of expected documents
 * @param {Number} [page] The expected page
 * @param {Object} [sort] A sort object
 * @param {Function} callback The function to call when it's done
 *   - **Error** The error if an error occurred, null otherwise
 *   - **Array** The list of documents
 *   - **Object** Pagination information
 */
MongoDatabase.prototype.search = function(collection, criteria, projection, limit, page, sort, callback) {
  this.db.collection(collection, function(error, fetchedCollection) {
    if (error)
      return callback(error);

    criteria = criteria || {};
    projection = projection || {};
    limit = limit || -1;
    sort = sort || {};
    var skip = limit * (page - 1) || 0;

    if (limit === -1)
      fetchedCollection.find(criteria, projection).sort(sort).toArray(callback);
    else {
      var cursor = fetchedCollection.find(criteria, projection).sort(sort).skip(skip).limit(limit);
      cursor.toArray(function(err, res) {
        if (err) return callback(err, null, null);
        cursor.count(false, null, function(error, count) {
          if (error) callback(error, null, null);
          var paginate = {
            limit: limit,
            page: page,
            pages: Math.ceil(count / limit),
            size: count
          };
          var resultArray = res || [];
          callback(error, resultArray, paginate);
        });
      });
    }

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
 * @return {Store} An express-session store
 */
MongoDatabase.prototype.getStore = function() {
  return new MongoStore({db: this.db});
};


/**
 * increase values in several documents from collection.
 *
 * @method increase
 * @async
 * @param {String} collection The collection to work on
 * @param {Object} filter Filters formatted like MongoDB filters
 * @param {Object} data Document data
 * @param {Function} callback The function to call when it's done
 *   - **Error** The error if an error occurred, null otherwise
 *   - **Number** The number of increased documents
 */
MongoDatabase.prototype.increase = function(collection, filter, data, callback) {
  var increase = {$inc: data};

  this.db.collection(collection, function(error, fetchedCollection) {
    if (error)
      return callback(error);

    fetchedCollection.updateMany(filter, increase, function(error, result) {
      if (error)
        callback(error);
      else
        callback(null, result.modifiedCount);
    });
  });
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

  self.db.listCollections({name: collection}).toArray(function(error, item) {
    if (!item.length)
        return callback();

    self.db.collection(collection, function(error, fetchedCollection) {
      if (error)
        return callback(error);

      fetchedCollection.rename(target, callback);
     });
  });
};
