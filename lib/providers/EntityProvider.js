'use strict';

/**
 * @module providers
 */

var util = require('util');
var Provider = process.requireApi('lib/providers/Provider.js');

/**
 * Defines base provider for all providers which need to provide
 * basic CRUD (**C**read **R**ead **U**pdate **D**elete) operations on a collection.
 *
 * Each entity model as it's own associated Provider (extending EntityProvider).
 *
 *     // Implement a EntityProvider : "CustomEntityProvider"
 *     var util = require('util');
 *     var openVeoApi = require('@openveo/api');
 *
 *     function CustomEntityProvider(database) {
 *       CustomEntityProvider.super_.call(this, database, 'customCollection');
 *     }
 *
 *     util.inherits(CustomEntityProvider, openVeoApi.providers.EntityProvider);
 *
 * @class EntityProvider
 * @extends Provider
 * @constructor
 * @param {Database} database The database to interact with
 * @param {String} collection The name of the collection to work on
 * @throws {Error} If database and / or collection are not as expected
 */
function EntityProvider(database, collection) {
  EntityProvider.super_.call(this, database, collection);
}

module.exports = EntityProvider;
util.inherits(EntityProvider, Provider);

/**
 * Gets an entity.
 *
 * @method getOne
 * @async
 * @param {String} id The entity id
 * @param {Object} filter A MongoDB filter
 * @param {Function} callback The function to call when it's done
 *   - **Error** The error if an error occurred, null otherwise
 *   - **Object** The entity
 */
EntityProvider.prototype.getOne = function(id, filter, callback) {
  if (!filter) filter = {};
  filter.id = id;

  this.database.get(this.collection, filter,
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
 * Gets an ordered list of entities by page.
 *
 * @method getPaginatedFilteredEntities
 * @async
 * @param {Object} [filter] MongoDB filter
 * @param {Number} [limit] The maximum number of expected entities
 * @param {Number} [page] The expected page
 * @param {Object} [sort] A sort object
 * @param {Function} callback The function to call when it's done
 *   - **Error** The error if an error occurred, null otherwise
 *   - **Array** The list of entities
 *   - **Object** Pagination information
 */
EntityProvider.prototype.getPaginatedFilteredEntities = function(filter, count, page, sort, callback) {
  this.database.search(this.collection, filter, null, count, page, sort, callback);
};

/**
 * Gets all entities.
 *
 * @method get
 * @async
 * @param {Object} filter A MongoDB filter
 * @param {Function} callback The function to call when it's done
 *   - **Error** The error if an error occurred, null otherwise
 *   - **Array** The list of entities
 */
EntityProvider.prototype.get = function(filter, callback) {
  this.database.get(this.collection, filter, {
    _id: 0
  },
  -1, callback);
};

/**
 * Adds entities.
 *
 * @method add
 * @async
 * @param {Array} data The list of entities' data to store into the collection
 * @param {Function} [callback] The function to call when it's done
 *   - **Error** The error if an error occurred, null otherwise
 *   - **Number** The total amount of documents inserted
 *   - **Array** All the documents inserted
 */
EntityProvider.prototype.add = function(data, callback) {
  var datas = Array.isArray(data) ? data : [data];

  this.database.insert(this.collection, datas, callback || function(error) {
    if (error)
      process.logger.error('Error while inserting entities with message : ' +
                           error.message, datas);
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
  var filter = {};
  filter['locked'] = {$ne: true};
  filter['id'] = id;

  this.database.update(this.collection, filter, data, callback || function(error) {
    if (error)
      process.logger.error('Error while updating entities message : ' +
                           error.message, data);
  });
};

/**
 * Removes one or several entities.
 *
 * If the entity has the property "locked", it won't be removed.
 *
 * @method remove
 * @async
 * @param {String|Array} ids Id(s) of the document(s) to remove from the collection
 * @param {Function} callback The function to call when it's done
 *   - **Error** The error if an error occurred, null otherwise
 *   - **Number** The number of deleted entities
 */
EntityProvider.prototype.remove = function(ids, callback) {
  var filter = {};
  filter['locked'] = {$ne: true};
  filter['id'] = {$in: null};
  filter['id']['$in'] = (Array.isArray(ids)) ? ids : [ids];

  this.database.remove(this.collection, filter, callback || function(error) {
    if (error)
      process.logger.error('Error while removing entities with message : ' + error.message, ids);
  });
};

/**
 * Removes a property on all documents in the collection.
 *
 * If the entity has the property "locked", it won't be updated.
 *
 * @method removeProp
 * @async
 * @param {String} property The property name to remove
 * @param {Function} callback The function to call when it's done
 *   - **Error** The error if an error occurred, null otherwise
 *   - **Number** The number of modified entities
 */
EntityProvider.prototype.removeProp = function(property, callback) {
  var filter = {};
  filter['locked'] = {$ne: true};

  this.database.removeProp(this.collection, property, filter, callback || function(error) {
    if (error)
      process.logger.error('Error while removing property from entities(s) with message : ' +
                           error.message, property);
  });
};

/**
 * Increase an entity.
 *
 * If the entity has the property "locked", it won't be increased.
 *
 * @method increase
 * @async
 * @param {String} id The id of the entity to update
 * @param {Object} data Object which key is the parameter to increase and value, amount of increase/decrease
 *   - Ex: {views: 56, priority: -5}
 * @param {Function} callback The function to call when it's done
 *   - **Error** The error if an error occurred, null otherwise
 *   - **Number** The number of updated items
 */
EntityProvider.prototype.increase = function(id, data, callback) {
  var filter = {};
  filter['locked'] = {$ne: true};
  filter['id'] = id;
  this.database.increase(this.collection, filter, data, callback || function(error) {
    if (error)
      process.logger.error('Error while increasing entities message : ' +
                           error.message, data);
  });
};
