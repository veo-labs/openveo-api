'use strict';

/**
 * @module providers
 */

var Database = process.requireAPI('lib/Database.js');

/**
 * Defines class EntityProvider.
 *
 * The EntityProvider offers basic CRUD (**C**read **R**ead **U**pdate **D**elete) operations on a collection.<br/>
 * EntityProvider must not be used directly. Use one of its sub class instead.
 *
 * Each entity model as it's own associated Provider (sub class of EntityProvider).
 *
 * @example
 *
 *     // Example for implementing a new EntityProvider named "CustomProvider"
 *
 *     // CustomProvider.js
 *
 *      var util = require('util');
 *      var api = require('@openveo/api');
 *
 *      function CustomProvider(database) {
 *
 *        // Initialize the entity provider with collection "customCollection"
 *        api.EntityProvider.prototype.init.call(this, database, 'customCollection');
 *
 *      }
 *
 *      // CustomProvider must extend EntityProvider
 *      module.exports = CustomProvider;
 *      util.inherits(CustomProvider, api.EntityProvider);
 *
 * @example
 *
 *     // Example for how to use CustomProvider defined in previous example
 *
 *     var api = require('@openveo/api');
 *
 *     var CustomProvider = process.require('CustomProvider.js');
 *     var provider = new CustomProvider(api.applicationStorage.getDatabase()));
 *
 * @class EntityProvider
 * @constructor
 */
function EntityProvider(database, collection) {
  this.init(database, collection);
}

module.exports = EntityProvider;

/**
 * Initializes an EntityProvider with a collection.
 *
 * @method init
 * @protected
 * @param {Database} database The database to interact with
 * @param {String} collection The collection name where entities are stored
 */
EntityProvider.prototype.init = function(database, collection) {
  this.database = database;
  this.collection = collection;

  if (!this.database || !this.collection)
    throw new Error('An EntityProvider needs a database and a collection');

  if (!(this.database instanceof Database))
    throw new Error('Database must be an of type Database');

};

/**
 * Gets an entity.
 *
 * @method getOne
 * @async
 * @param {String} id The entity id
 * @param {Function} callback The function to call when it's done
 *   - **Error** The error if an error occurred, null otherwise
 *   - **Object** The entity
 */
EntityProvider.prototype.getOne = function(id, callback) {
  this.database.get(this.collection, {
    id: id
  },
    {
      _id: 0
    },
  1, function(error, entities) {
    if (entities && entities.length)
      callback(error, entities[0]);
    else
      callback(error);
  });
};

/**
 * Gets an entity filter by custom filter.
 *
 * @method getByFilter
 * @async
 * @param {Object} filter A MongoDB filter
 * @param {Function} callback The function to call when it's done
 *   - **Error** The error if an error occurred, null otherwise
 *   - **Object** The entity
 */
EntityProvider.prototype.getByFilter = function(filter, callback) {
  this.database.get(this.collection, filter, null, 1, function(error, entities) {
    if (entities && entities.length)
      callback(error, entities[0]);
    else
      callback(error);
  });
};

/**
 * *
 * @param {type} options
 *
 * sort is a collection of key to sort with the order value (-1 : desc, 1 asc)
 * example ( {"name":-1, age:"1"}  specifies a descending sort by the name field and then an ascending sort by
 * the age field
 *
 * filter is a collection of filter
 * example {"name": {$regex : ".*sam.*}, "age": {$lt:20}} specifies all document witch the name field contains
 * "sam" aged less than 20
 *
 * @param {type} filter
 * @param {type} count
 * @param {type} page
 * @param {type} sort
 * @param {type} callback
 * @returns {undefined}
 */
EntityProvider.prototype.getPaginatedFilteredEntities = function(filter, count, page, sort, callback) {
  this.database.search(this.collection, filter, null, count, page, sort, callback);
};


/**
 * Gets all entities.
 *
 * @method get
 * @async
 * @param {Function} callback The function to call when it's done
 *   - **Error** The error if an error occurred, null otherwise
 *   - **Array** The list of entities
 */
EntityProvider.prototype.get = function(callback) {
  this.database.get(this.collection, null, {
    _id: 0
  },
  -1, callback);
};

/**
 * Adds a new entity.
 *
 * @method add
 * @async
 * @param {Object} data Data to store into the collection, its structure depends on the entity type
 * @param {Function} callback The function to call when it's done
 *   - **Error** The error if an error occurred, null otherwise
 */
EntityProvider.prototype.add = function(data, callback) {
  this.database.insert(this.collection, data, callback || function() {

    // TODO Log the error if any

  });
};

/**
 * Updates an entity.
 *
 * If the entity has the property "locked", it won't be updated.
 *
 * @method update
 * @async
 * @param {String} id The id of the entity to update
 * @param {Object} data Entity data, its structure depends on the entity type
 * @param {Function} callback The function to call when it's done
 *   - **Error** The error if an error occurred, null otherwise
 *   - **Number** The number of updated items
 */
EntityProvider.prototype.update = function(id, data, callback) {
  this.database.update(this.collection, {
    id: id,
    locked: {
      $ne: true
    }
  },
  data, callback || function() {

    // TODO Log the error if any

  });
};

/**
 * Removes an entity.
 *
 * If the entity has the property "locked", it won't be removed.
 *
 * @method remove
 * @async
 * @param {String} id The id of the entity to remove
 * @param {Function} callback The function to call when it's done
 *   - **Error** The error if an error occurred, null otherwise
 *   - **Number** The number of removed items
 */
EntityProvider.prototype.remove = function(id, callback) {
  this.database.remove(this.collection, {
    id: {
      $in: id
    },
    locked: {
      $ne: true
    }
  },
  callback || function() {

    // TODO Log the error if any

  });
};

/**
 * Removes an entity.
 *
 * If the entity has the property "locked", it won't be removed.
 *
 * @method remove
 * @async
 * @param {String} id The id of the entity to remove
 * @param {Function} callback The function to call when it's done
 *   - **Error** The error if an error occurred, null otherwise
 *   - **Number** The number of removed items
 */
EntityProvider.prototype.removeProp = function(prop, callback) {
  this.database.removeProp(
    this.collection,
    prop,
    callback || function() {
      // TODO Log the error if any
    });
};
