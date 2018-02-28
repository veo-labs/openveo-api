'use strict';

/**
 * @module providers
 */

var util = require('util');
var Provider = process.requireApi('lib/providers/Provider.js');

/**
 * Defines a provider holding a single type of resources.
 *
 * An entity provider manages a single type of resources. These resources are stored into the given storage / location.
 *
 * @class EntityProvider
 * @extends Provider
 * @constructor
 * @param {Storage} storage The storage to use to store provider entities
 * @param {String} location The location of the entities in the storage
 * @throws {TypeError} If storage and / or location is not valid
 */
function EntityProvider(storage, location) {
  EntityProvider.super_.call(this, storage);

  Object.defineProperties(this, {

    /**
     * The location of the entities in the storage.
     *
     * @property location
     * @type String
     * @final
     */
    location: {value: location}

  });

  if (Object.prototype.toString.call(this.location) !== '[object String]')
    throw new TypeError('location must be a string');
}

module.exports = EntityProvider;
util.inherits(EntityProvider, Provider);

/**
 * Fetches an entity.
 *
 * If filter corresponds to more than one entity, the first found entity will be the returned one.
 *
 * @method getOne
 * @async
 * @param {ResourceFilter} [filter] Rules to filter entities
 * @param {Object} [fields] Fields to be included or excluded from the response, by default all
 * fields are returned. Only "exclude" or "include" can be specified, not both
 * @param {Array} [fields.include] The list of fields to include in the response, all other fields are excluded
 * @param {Array} [fields.exclude] The list of fields to exclude from response, all other fields are included. Ignored
 * if include is also specified.
 * @param {Function} callback The function to call when it's done
 *   - **Error** The error if an error occurred, null otherwise
 *   - **Object** The entity
 */
EntityProvider.prototype.getOne = function(filter, fields, callback) {
  this.storage.getOne(this.location, filter, fields, callback);
};

/**
 * Fetches entities.
 *
 * @method get
 * @async
 * @param {ResourceFilter} [filter] Rules to filter entities
 * @param {Object} [fields] Fields to be included or excluded from the response, by default all
 * fields are returned. Only "exclude" or "include" can be specified, not both
 * @param {Array} [fields.include] The list of fields to include in the response, all other fields are excluded
 * @param {Array} [fields.exclude] The list of fields to exclude from response, all other fields are included. Ignored
 * if include is also specified.
 * @param {Number} [limit] A limit number of entities to retrieve (10 by default)
 * @param {Number} [page] The page number started at 0 for the first page
 * @param {Object} [sort] The list of fields to sort by with the field name as key and the sort order as
 * value (e.g. {field1: 'asc', field2: 'desc'})
 * @param {Function} callback The function to call when it's done
 *   - **Error** The error if an error occurred, null otherwise
 *   - **Array** The list of retrieved entities
 *   - **Object** Pagination information
 *     - **Number** limit The specified limit
 *     - **Number** page The actual page
 *     - **Number** pages The total number of pages
 *     - **Number** size The total number of entities
 */
EntityProvider.prototype.get = function(filter, fields, limit, page, sort, callback) {
  this.storage.get(this.location, filter, fields, limit, page, sort, callback);
};

/**
 * Gets all entities from storage iterating on all pages.
 *
 * @method getAll
 * @async
 * @param {ResourceFilter} [filter] Rules to filter entities
 * @param {Object} [fields] Fields to be included or excluded from the response, by default all
 * fields are returned. Only "exclude" or "include" can be specified, not both
 * @param {Array} [fields.include] The list of fields to include in the response, all other fields are excluded
 * @param {Array} [fields.exclude] The list of fields to exclude from response, all other fields are included. Ignored
 * if include is also specified.
 * @param {Object} sort The list of fields to sort by with the field name as key and the sort order as
 * value (e.g. {field1: 'asc', field2: 'desc'})
 * @param {Function} callback Function to call when it's done with:
 *  - **Error** An error if something went wrong, null otherwise
 *  - **Array** The list of entities
 */
EntityProvider.prototype.getAll = function(filter, fields, sort, callback) {
  var self = this;
  var page = 0;
  var allEntities = [];

  /**
   * Fetches all entities iterating on all pages.
   *
   * @param {Function} callback The function to call when it's done
   */
  function getEntities(callback) {
    self.get(filter, fields, null, page, sort, function(error, entities, pagination) {
      if (error) return callback(error);

      allEntities = allEntities.concat(entities);

      if (page < pagination.pages - 1) {

        // There are other pages
        // Get next page
        page++;
        getEntities(callback);

      } else {

        // No more pages
        // End it
        callback(null);
      }
    });
  }

  getEntities(function(error) {
    callback(error, allEntities);
  });
};

/**
 * Adds entities.
 *
 * @method add
 * @async
 * @param {Array} entities The list of entities to store
 * @param {Function} [callback] The function to call when it's done
 *   - **Error** The error if an error occurred, null otherwise
 *   - **Number** The total amount of entities inserted
 *   - **Array** The list of added entities
 */
EntityProvider.prototype.add = function(entities, callback) {
  if (!entities || !entities.length) return callback(null, 0);

  this.storage.add(this.location, entities, function(error, total, addedEntities) {
    this.executeCallback(callback, error, total, addedEntities);
  }.bind(this));
};

/**
 * Updates an entity.
 *
 * @method updateOne
 * @async
 * @param {ResourceFilter} [filter] Rules to filter the entity to update
 * @param {Object} data The modifications to perform
 * @param {Function} [callback] The function to call when it's done
 *   - **Error** The error if an error occurred, null otherwise
 *   - **Number** 1 if everything went fine
 */
EntityProvider.prototype.updateOne = function(filter, data, callback) {
  this.storage.updateOne(this.location, filter, data, function(error, total) {
    this.executeCallback(callback, error, total);
  }.bind(this));
};

/**
 * Removes entities.
 *
 * @method remove
 * @async
 * @param {ResourceFilter} [filter] Rules to filter entities to remove
 * @param {Function} [callback] The function to call when it's done
 *   - **Error** The error if an error occurred, null otherwise
 *   - **Number** The number of removed entities
 */
EntityProvider.prototype.remove = function(filter, callback) {
  this.storage.remove(this.location, filter, function(error, total) {
    this.executeCallback(callback, error, total);
  }.bind(this));
};

/**
 * Removes a field from entities.
 *
 * @method removeField
 * @async
 * @param {String} field The field to remove from entities
 * @param {ResourceFilter} [filter] Rules to filter entities to update
 * @param {Function} [callback] The function to call when it's done
 *   - **Error** The error if an error occurred, null otherwise
 *   - **Number** The number of updated entities
 */
EntityProvider.prototype.removeField = function(field, filter, callback) {
  this.storage.removeField(this.location, field, filter, function(error, total) {
    this.executeCallback(callback, error, total);
  }.bind(this));
};
