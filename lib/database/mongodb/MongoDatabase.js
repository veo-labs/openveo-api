'use strict';

/**
 * @module api-mongodb
 */

// Module dependencies
var util = require('util');
var mongodb = require('mongodb');
var Database = process.requireAPI('lib/Database.js');
var MongoClient = mongodb.MongoClient;

/**
 * Defines a MongoDB Database.
 *
 * @example
 *     var databaseConf = {
 *       "type" : "mongodb",
 *       "host" : "localhost",
 *       "port" : 27017,
 *       "database" : "openveo",
 *       "username" : "openveo",
 *       "password" : "***"
 *     };
 *
 * @class MongoDatabase
 * @constructor
 * @param Object databaseConf A database configuration object like
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
 * @param {Function} callback The function to call when connection
 * to the database is done
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

    // Connection failed
    if (error)
      callback(error);

    // Connection succeeded
    else {
      self.db = db;
      callback();
    }
  });

};

/**
 * Inserts a document into a collection.
 *
 * @method insert
 * @async
 * @param {String} collection The collection to work on
 * @param {Objet} data The document to insert into the collection
 * @param {Function} callback The function to call when it's done
 *   - **Error** The error if an error occurred, null otherwise
 */
MongoDatabase.prototype.insert = function(collection, data, callback) {
  collection = this.db.collection(collection);
  collection.insert(data, callback);
};

/**
 * Removes a document from a collection.
 *
 * @method remove
 * @async
 * @param {String} collection The collection to work on
 * @param {Object} criteria The remove criteria
 * @param {Function} callback The function to call when it's done
 *   - **Error** The error if an error occurred, null otherwise
 */
MongoDatabase.prototype.remove = function(collection, criteria, callback) {
  if (criteria && Object.keys(criteria).length) {
    collection = this.db.collection(collection);
    collection.remove(criteria, callback);
  }
};

/**
 * Updates a document.
 *
 * @method update
 * @async
 * @param {String} collection The collection to work on
 * @param {Object} criteria The update criteria
 * @param {Object} data Data to update
 * @param {Function} callback The function to call when it's done
 *   - **Error** The error if an error occurred, null otherwise
 */
MongoDatabase.prototype.update = function(collection, criteria, data, callback) {
  collection = this.db.collection(collection);
  collection.update(criteria, {
    $set: data
  },
    {
      multi: true
    },
  callback);
};


/**
 * Gets a list of documents.
 *
 * @method get
 * @async
 * @param {String} collection The collection to work on
 * @param {Object} criteria An object of criterias
 * @param {Object} projection Fields to return using projection operators
 * @param {Number} limit An optional limit number of items to retrieve
 * @param {Function} callback The function to call when it's done
 *   - **Error** The error if an error occurred, null otherwise
 *   - **Array** The retrieved data
 */
MongoDatabase.prototype.get = function(collection, criteria, projection, limit, callback) {
  collection = this.db.collection(collection);

  criteria = criteria || {};
  projection = projection || {};
  limit = limit || -1;
  if (limit === -1)
    collection.find(criteria, projection).toArray(callback);
  else
    collection.find(criteria, projection).limit(limit).toArray(callback);
};

/**
 * Gets an ordered list of documents by page.
 *
 * @method search
 * @async
 * @param {String} collection The collection to work on
 * @param {Object} criteria An object of criterias
 * @param {Object} projection Fields to return using projection operators
 * @param {Number} count The expected number of results
 * @param {Number} limit The maximum number of expected documents
 * @param {Number} page The expected page
 * @param {Object} sort A sort object
 * @param {Function} callback The function to call when it's done
 *   - **Error** The error if an error occurred, null otherwise
 *   - **Array** The list of videos
 *   - **Object** Pagination information
 */
MongoDatabase.prototype.search = function(collection, criteria, projection, limit, page, sort, callback) {

  collection = this.db.collection(collection);

  criteria = criteria || {};
  projection = projection || {};
  limit = limit || -1;
  sort = sort || {};
  var skip = limit * (page - 1) || 0;

  if (limit === -1)
    collection.find(criteria, projection).sort(sort).toArray(callback);
  else {
    var cursor = collection.find(criteria, projection).sort(sort).skip(skip).limit(limit);
    cursor.toArray(function(err, res) {
      if (err) callback(err, null, null);
      cursor.count(false, null, function(error, count) {
        if (error) callback(error, null, null);
        var paginate = {
          count: limit,
          page: page,
          pages: Math.ceil(count / limit),
          size: count
        };
        var resultArray = res || [];
        callback(error, resultArray, paginate);
      });
    });
  }
};
