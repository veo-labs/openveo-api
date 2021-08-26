'use strict';

/**
 * @module storages/Database
 * @ignore
 */

var util = require('util');
var Storage = process.requireApi('lib/storages/Storage.js');

/**
 * Defines base database for all databases.
 *
 * This should not be used directly, use one of its subclasses instead.
 *
 * @class Database
 * @extends module:storages/Storage~Storage
 * @constructor
 * @ignore
 * @param {Object} configuration A database configuration object depending on the database type
 * @param {String} configuration.type The database type
 * @param {String} configuration.host Database server host
 * @param {Number} configuration.port Database server port
 * @param {String} configuration.database The name of the database
 * @param {String} configuration.username The name of the database user
 * @param {String} configuration.password The password of the database user
 */
function Database(configuration) {
  Database.super_.call(this, configuration);

  Object.defineProperties(this,

    /** @lends module:storages/Database~Database */
    {

      /**
       * Database host.
       *
       * @type {String}
       * @instance
       * @readonly
       */
      host: {value: configuration.host},

      /**
       * Database port.
       *
       * @type {Number}
       * @instance
       * @readonly
       */
      port: {value: configuration.port},

      /**
       * Database name.
       *
       * @type {String}
       * @instance
       * @readonly
       */
      name: {value: configuration.database},

      /**
       * Database user name.
       *
       * @type {String}
       * @instance
       * @readonly
       */
      username: {value: configuration.username},

      /**
       * Database user password.
       *
       * @type {String}
       * @instance
       * @readonly
       */
      password: {value: configuration.password}

    }

  );
}

module.exports = Database;
util.inherits(Database, Storage);

/**
 * Establishes connection to the database.
 *
 * @param {callback} callback The function to call when connection to the database is established
 */
Database.prototype.connect = function(callback) {
  throw new Error('connect method not implemented for this Database');
};

/**
 * Closes connection to the database.
 *
 * @param {callback} callback The function to call when connection is closed
 */
Database.prototype.close = function(callback) {
  throw new Error('close method not implemented for this Database');
};

/**
 * Gets the list of indexes for a collection.
 *
 * @param {String} collection The collection to work on
 * @param {module:storages/Database~Database~getIndexesCallback} callback The function to call when it's done
 */
Database.prototype.getIndexes = function(collection, callback) {
  throw new Error('getIndexes method not implemented for this Database');
};

/**
 * Creates indexes for a collection.
 *
 * @param {String} collection The collection to work on
 * @param {Array} indexes A list of indexes using MongoDB format
 * @param {module:storages/Database~Database~createIndexesCallback} callback The function to call when it's done
 */
Database.prototype.createIndexes = function(collection, indexes, callback) {
  throw new Error('createIndexes method not implemented for this Database');
};

/**
 * Drops index from a collection.
 *
 * @param {String} collection The collection to work on
 * @param {String} indexName The name of the index to drop
 * @param {module:storages/Database~Database~dropIndexCallback} callback The function to call when it's done
 */
Database.prototype.dropIndex = function(collection, indexName, callback) {
  throw new Error('dropIndex method not implemented for this Database');
};

/**
 * Gets a session store for the database.
 *
 * @param {String} collection The collection to work on
 * @return {Object} A session store
 */
Database.prototype.getStore = function(collection) {
  throw new Error('getStore method not implemented for this Database');
};

/**
 * Renames a collection.
 *
 * @param {String} collection The collection to work on
 * @param {String} target The new name of the collection
 * @param {callback} callback The function to call when it's done
 */
Database.prototype.renameCollection = function(collection, target, callback) {
  throw new Error('renameCollection method not implemented for this Database');
};

/**
 * Removes a collection from the database.
 *
 * @param {String} collection The collection to work on
 * @param {callback} callback The function to call when it's done
 */
Database.prototype.removeCollection = function(collection, callback) {
  throw new Error('removeCollection method not implemented for this Database');
};

/**
 * @callback module:storages/Database~Database~getIndexesCallback
 * @param {(Error|null)} error The error if an error occurred, null otherwise
 * @param {(Array|Undefined)} indexes The list of indexes
 */

/**
 * @callback module:storages/Database~Database~createIndexesCallback
 * @param {(Error|null)} error The error if an error occurred, null otherwise
 * @param {(Object|Undefined)} result Information about the operation
 */

/**
 * @callback module:storages/Database~Database~dropIndexCallback
 * @param {(Error|null)} error The error if an error occurred, null otherwise
 * @param {(Object|Undefined)} result Information about the operation
 */
