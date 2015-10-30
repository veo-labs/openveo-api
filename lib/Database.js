'use strict';

/**
 * Defines Database interface.
 *
 * @module database
 */

/**
 * Saves database configuration.
 *
 * @example
 *
 *     // Example for how to use MongoDB database
 *
 *     var api = require('@openveo/api');
 *     var databaseConf = {
 *      ...
 *     };
 *
 *     // Create a new instance of the database
 *     var db = api.Database.get(databaseConf);
 *
 *     // Prefer using OpenVeo database instance
 *     var db = api.applicationStorage.getDatabase();
 *
 *
 * @class Database
 * @constructor
 * @param {Object} databaseConf A database configuration object
 */
function Database(databaseConf) {
  this.conf = databaseConf;

  if (!this.conf)
    throw new Error('No database configuration');
}

module.exports = Database;

/**
 * Gets an instance of a Database using the given
 * database configuration.
 *
 * @method getDatabase
 * @static
 * @param {Object} databaseConf A database configuration object
 * @return {Database} A Database instance
 */
Database.getDatabase = function(databaseConf) {

  if (databaseConf && databaseConf.type) {

    switch (databaseConf.type) {

      case 'mongodb':
        var MongoDatabase = process.requireAPI('lib/database/mongodb/MongoDatabase.js');
        return new MongoDatabase(databaseConf);

      default:
        throw new Error('Unknown database type');
    }

  }

};

/**
 * Establishes connection to the database.
 *
 * @method connect
 * @async
 * @param {Function} callback The function to call when connection
 * to the database is done
 *   - **Error** The error if an error occurred, null otherwise
 */
Database.prototype.connect = function() {
  throw new Error('connect method not implemented for this database');
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
Database.prototype.insert = function() {
  throw new Error('insert method not implemented for this database');
};

/**
 * Removes a document from a collection.
 *
 * @method remove
 * @async
 * @param {String} collection The collection to work on
 * @param {Object} criteria MongoDB criterias
 * @param {Function} callback The function to call when it's done
 *   - **Error** The error if an error occurred, null otherwise
 */
Database.prototype.remove = function() {
  throw new Error('remove method not implemented for this database');
};

/**
 * Updates a document.
 *
 * @method update
 * @async
 * @param {String} collection The collection to work on
 * @param {Object} criteria MongoDB criterias
 * @param {Object} data The document
 * @param {Function} callback The function to call when it's done
 *   - **Error** The error if an error occurred, null otherwise
 */
Database.prototype.update = function() {
  throw new Error('update method not implemented for this database');
};

/**
 * Gets a list of documents.
 *
 * @method get
 * @async
 * @param {String} collection The collection to work on
 * @param {Object} criteria MongoDB criterias
 * @param {Object} projection MongoDB projection
 * @param {Number} limit An optional limit number of items to retrieve
 * @param {Function} callback The function to call when it's done
 *   - **Error** The error if an error occurred, null otherwise
 *   - **Array** The list of documents
 */
Database.prototype.get = function() {
  throw new Error('get method not implemented for this database');
};