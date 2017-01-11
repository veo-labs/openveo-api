'use strict';

/**
 * @module database
 */

/**
 * Defines base database for all databases.
 *
 * Use {{#crossLink "factory"}}{{/crossLink}} to get an instance of a MongoDB Database.
 *
 * @class Database
 * @constructor
 * @param {Object} databaseConf A database configuration object depending on the database type
 * @param {String} databaseConf.type The database type
 * @param {String} databaseConf.host Database server host
 * @param {Number} databaseConf.port Database server port
 * @param {String} databaseConf.database The name of the database
 * @param {String} databaseConf.username The name of the database user
 * @param {String} databaseConf.password The password of the database user
 * @throws {TypeError} If database configuration is not as expected
 */
function Database(databaseConf) {
  if (!databaseConf)
    throw new TypeError('Missing database configuration');

  Object.defineProperties(this, {

    /**
     * Database's type.
     *
     * @property type
     * @type String
     * @final
     */
    type: {value: databaseConf.type},

    /**
     * Database's host.
     *
     * @property host
     * @type String
     * @final
     */
    host: {value: databaseConf.host},

    /**
     * Database's port.
     *
     * @property port
     * @type Number
     * @final
     */
    port: {value: databaseConf.port},

    /**
     * Database's name.
     *
     * @property name
     * @type String
     * @final
     */
    name: {value: databaseConf.database},

    /**
     * Database's user name.
     *
     * @property username
     * @type String
     * @final
     */
    username: {value: databaseConf.username},

    /**
     * Database's user password.
     *
     * @property password
     * @type String
     * @final
     */
    password: {value: databaseConf.password}

  });
}

module.exports = Database;

/**
 * Establishes connection to the database.
 *
 * @method connect
 * @async
 * @param {Function} callback The function to call when connection to the database is established
 *   - **Error** The error if an error occurred, null otherwise
 */
Database.prototype.connect = function() {
  throw new Error('connect method not implemented for this database');
};

/**
 * Closes connection to the database.
 *
 * @method close
 * @async
 * @param {Function} callback The function to call when connection is closed
 *   - **Error** The error if an error occurred, null otherwise
 */
Database.prototype.close = function() {
  throw new Error('close method not implemented for this database');
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
Database.prototype.insert = function() {
  throw new Error('insert method not implemented for this database');
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
Database.prototype.remove = function() {
  throw new Error('remove method not implemented for this database');
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
Database.prototype.removeProp = function() {
  throw new Error('removeProp method not implemented for this database');
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
Database.prototype.update = function() {
  throw new Error('update method not implemented for this database');
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
Database.prototype.get = function() {
  throw new Error('get method not implemented for this database');
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
Database.prototype.search = function() {
  throw new Error('search method not implemented for this database');
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
Database.prototype.getIndexes = function() {
  throw new Error('getIndexes method not implemented for this database');
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
Database.prototype.createIndexes = function() {
  throw new Error('createIndexes method not implemented for this database');
};

/**
 * Gets an express-session store for the database.
 *
 * @method getStore
 * @param {String} collection The collection to work on
 * @return {Store} An express-session store
 */
Database.prototype.getStore = function() {
  throw new Error('getStore method not implemented for this database');
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
Database.prototype.increase = function() {
  throw new Error('increase method not implemented for this database');
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
Database.prototype.renameCollection = function() {
  throw new Error('renameCollection method not implemented for this database');
};

/**
 * Remove a collection from the database
 *
 * @method removeCollection
 * @async
 * @param {String} collection The collection to work on
 * @param {Function} callback The function to call when it's done
 *   - **Error** The error if an error occurred, null otherwise
 */
Database.prototype.removeCollection = function() {
  throw new Error('removeCollection method not implemented for this database');
};
