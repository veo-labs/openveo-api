'use strict';

/**
 * @module providers/EntityProvider
 */

var util = require('util');
var Provider = process.requireApi('lib/providers/Provider.js');

/**
 * Defines a provider holding a single type of resources.
 *
 * An entity provider manages a single type of resources. These resources are stored into the given storage / location.
 *
 * @class EntityProvider
 * @extends module:providers/Provider~Provider
 * @constructor
 * @param {module:storages/Storage~Storage} storage The storage to use to store provider entities
 * @param {String} location The location of the entities in the storage
 * @throws {TypeError} If storage and / or location is not valid
 */
function EntityProvider(storage, location) {
  EntityProvider.super_.call(this, storage);

  Object.defineProperties(this,

    /** @lends module:providers/EntityProvider~EntityProvider */
    {

      /**
       * The location of the entities in the storage.
       *
       * @type {String}
       * @instance
       * @readonly
       */
      location: {value: location}

    }

  );

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
 * @param {module:storages/ResourceFilter~ResourceFilter} [filter] Rules to filter entities
 * @param {Object} [fields] Fields to be included or excluded from the response, by default all fields are returned.
 * Only "exclude" or "include" can be specified, not both
 * @param {Array} [fields.include] The list of fields to include in the response, all other fields are excluded
 * @param {Array} [fields.exclude] The list of fields to exclude from response, all other fields are included. Ignored
 * if include is also specified.
 * @param {module:providers/EntityProvider~EntityProvider~getOneCallback} callback The function to call when it's done
 */
EntityProvider.prototype.getOne = function(filter, fields, callback) {
  this.storage.getOne(this.location, filter, fields, callback);
};

/**
 * Fetches entities.
 *
 * @param {module:storages/ResourceFilter~ResourceFilter} [filter] Rules to filter entities
 * @param {Object} [fields] Fields to be included or excluded from the response, by default all
 * fields are returned. Only "exclude" or "include" can be specified, not both
 * @param {Array} [fields.include] The list of fields to include in the response, all other fields are excluded
 * @param {Array} [fields.exclude] The list of fields to exclude from response, all other fields are included. Ignored
 * if include is also specified.
 * @param {Number} [limit] A limit number of entities to retrieve (10 by default)
 * @param {Number} [page] The page number started at 0 for the first page
 * @param {Object} [sort] The list of fields to sort by with the field name as key and the sort order as
 * value (e.g. {field1: 'asc', field2: 'desc', field3: 'score'})
 * @param {module:providers/EntityProvider~EntityProvider~getCallback} callback The function to call when it's done
 */
EntityProvider.prototype.get = function(filter, fields, limit, page, sort, callback) {
  this.storage.get(this.location, filter, fields, limit, page, sort, callback);
};

/**
 * Gets all entities from storage iterating on all pages.
 *
 * @param {module:storages/ResourceFilter~ResourceFilter} [filter] Rules to filter entities
 * @param {Object} [fields] Fields to be included or excluded from the response, by default all
 * fields are returned. Only "exclude" or "include" can be specified, not both
 * @param {Array} [fields.include] The list of fields to include in the response, all other fields are excluded
 * @param {Array} [fields.exclude] The list of fields to exclude from response, all other fields are included. Ignored
 * if include is also specified.
 * @param {Object} sort The list of fields to sort by with the field name as key and the sort order as
 * value (e.g. {field1: 'asc', field2: 'desc', field3: 'score'})
 * @param {module:providers/EntityProvider~EntityProvider~getAllCallback} callback Function to call when it's done
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
 * @param {Array} entities The list of entities to store
 * @param {module:providers/EntityProvider~EntityProvider~addCallback} [callback] The function to call when it's done
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
 * @param {module:storages/ResourceFilter~ResourceFilter} [filter] Rules to filter the entity to update
 * @param {Object} data The modifications to perform
 * @param {module:providers/EntityProvider~EntityProvider~updateOneCallback} [callback] The function to call when it's
 * done
 */
EntityProvider.prototype.updateOne = function(filter, data, callback) {
  this.storage.updateOne(this.location, filter, data, function(error, total) {
    this.executeCallback(callback, error, total);
  }.bind(this));
};

/**
 * Removes entities.
 *
 * @param {module:storages/ResourceFilter~ResourceFilter} [filter] Rules to filter entities to remove
 * @param {module:providers/EntityProvider~EntityProvider~removeCallback} [callback] The function to call when it's done
 */
EntityProvider.prototype.remove = function(filter, callback) {
  this.storage.remove(this.location, filter, function(error, total) {
    this.executeCallback(callback, error, total);
  }.bind(this));
};

/**
 * Removes a field from entities.
 *
 * @param {String} field The field to remove from entities
 * @param {module:storages/ResourceFilter~ResourceFilter} [filter] Rules to filter entities to update
 * @param {module:providers/EntityProvider~EntityProvider~removeFieldCallback} [callback] The function to call when
 * it's done
 */
EntityProvider.prototype.removeField = function(field, filter, callback) {
  this.storage.removeField(this.location, field, filter, function(error, total) {
    this.executeCallback(callback, error, total);
  }.bind(this));
};

/**
 * @callback module:providers/EntityProvider~EntityProvider~getOneCallback
 * @param {(Error|null)} error The error if an error occurred, null otherwise
 * @param {Object|undefined} entity The entity
 */

/**
 * @callback module:providers/EntityProvider~EntityProvider~getCallback
 * @param {(Error|null)} error The error if an error occurred, null otherwise
 * @param {Array|undefined} entities The list of retrieved entities
 * @param {Object|undefined} pagination Pagination information
 * @param {Number|undefined} pagination.limit The specified limit
 * @param {Number|undefined} pagination.page The actual page
 * @param {Number|undefined} pagination.pages The total number of pages
 * @param {Number|undefined} pagination.size The total number of entities
 */

/**
 * @callback module:providers/EntityProvider~EntityProvider~getAllCallback
 * @param {(Error|null)} error The error if an error occurred, null otherwise
 * @param {Array|undefined} entities The list of entities
 */

/**
 * @callback module:providers/EntityProvider~EntityProvider~addCallback
 * @param {(Error|null)} error The error if an error occurred, null otherwise
 * @param {(Number|undefined)} total The total amount of entities inserted
 * @param {(Array|undefined)} entities The list of added entities
 */

/**
 * @callback module:providers/EntityProvider~EntityProvider~updateOneCallback
 * @param {(Error|null)} error The error if an error occurred, null otherwise
 * @param {(Number|undefined)} 1 if everything went fine
 */

/**
 * @callback module:providers/EntityProvider~EntityProvider~removeCallback
 * @param {(Error|null)} error The error if an error occurred, null otherwise
 * @param {(Number|undefined)} total The number of removed entities
 */

/**
 * @callback module:providers/EntityProvider~EntityProvider~removeFieldCallback
 * @param {(Error|null)} error The error if an error occurred, null otherwise
 * @param {(Number|undefined)} total The number of updated entities
 */
