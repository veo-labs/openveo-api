'use strict';

/**
 * @module storages
 */

var util = require('util');
var Storage = process.requireApi('lib/storages/Storage.js');

/**
 * Defines base database for all databases.
 *
 * This should not be used directly, use one of its subclasses instead.
 *
 * @class Database
 * @extends Storage
 * @constructor
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

  Object.defineProperties(this, {

    /**
     * Database host.
     *
     * @property host
     * @type String
     * @final
     */
    host: {value: configuration.host},

    /**
     * Database port.
     *
     * @property port
     * @type Number
     * @final
     */
    port: {value: configuration.port},

    /**
     * Database name.
     *
     * @property name
     * @type String
     * @final
     */
    name: {value: configuration.database},

    /**
     * Database user name.
     *
     * @property username
     * @type String
     * @final
     */
    username: {value: configuration.username},

    /**
     * Database user password.
     *
     * @property password
     * @type String
     * @final
     */
    password: {value: configuration.password}

  });
}

module.exports = Database;
util.inherits(Database, Storage);

/**
 * Establishes connection to the database.
 *
 * @method connect
 * @async
 * @param {Function} callback The function to call when connection to the database is established
 *   - **Error** The error if an error occurred, null otherwise
 */
Database.prototype.connect = function(callback) {
  throw new Error('connect method not implemented for this Database');
};

/**
 * Closes connection to the database.
 *
 * @method close
 * @async
 * @param {Function} callback The function to call when connection is closed
 *   - **Error** The error if an error occurred, null otherwise
 */
Database.prototype.close = function(callback) {
  throw new Error('close method not implemented for this Database');
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
Database.prototype.getIndexes = function(collection, callback) {
  throw new Error('getIndexes method not implemented for this Database');
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
Database.prototype.createIndexes = function(collection, indexes, callback) {
  throw new Error('createIndexes method not implemented for this Database');
};

/**
 * Drops index from a collection.
 *
 * @method dropIndex
 * @async
 * @param {String} collection The collection to work on
 * @param {String} indexName The name of the index to drop
 * @param {Function} callback The function to call when it's done
 *   - **Error** The error if an error occurred, null otherwise
 *   - **Object** Information about the operation
 */
Database.prototype.dropIndex = function(collection, indexName, callback) {
  throw new Error('dropIndex method not implemented for this Database');
};

/**
 * Gets a session store for the database.
 *
 * @method getStore
 * @param {String} collection The collection to work on
 * @return {Store} A session store
 */
Database.prototype.getStore = function(collection) {
  throw new Error('getStore method not implemented for this Database');
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
Database.prototype.renameCollection = function(collection, target, callback) {
  throw new Error('renameCollection method not implemented for this Database');
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
Database.prototype.removeCollection = function(collection, callback) {
  throw new Error('removeCollection method not implemented for this Database');
};
