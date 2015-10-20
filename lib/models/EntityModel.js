'use strict';

/**
 * @module models
 */

/**
 * Defines class EntityModel.
 *
 * The EntityModel provides basic CRUD (**C**read **R**ead **U**pdate **D**elete) operations on entities.<br/>
 * All entities models must extend EntityModel. EntityModel must not be used directly. Use one of its sub class
 * instead.
 *
 * Each entity as it's own associated Model (sub class of EntityModel).
 *
 * @example
 *
 *     // Example for implementing a new EntityModel named "CustomModel"
 *
 *     // CustomModel.js
 *
 *     var util = require('util');
 *     var api = require('@openveo/api');
 *     var CustomProvider = process.require('CustomProvider.js');
 *
 *     function CustomModel() {
 *
 *       // Initialize the entity model with a dedicated provider
 *       api.EntityModel.prototype.init.call(this, new CustomProvider(api.applicationStorage.getDatabase()));
 *
 *     }
 *
 *     // CustomModel must extends EntityModel
 *     module.exports = CustomModel;
 *     util.inherits(CustomModel, api.EntityModel);
 *
 * @example
 *
 *     // Example for how to use CustomModel defined in previous example
 *
 *     var api = require('@openveo/api');
 *
 *     var CustomModel = process.require('CustomModel.js');
 *     var model = new CustomModel();
 *
 * @class EntityModel
 * @constructor
 */
function EntityModel() {
}

module.exports = EntityModel;

/**
 * Initializes an EntityModel with a provider.
 *
 * @method init
 * @protected
 * @param {EntityProvider} provider The entity provider
 */
EntityModel.prototype.init = function(provider) {
  this.provider = provider;

  if (!this.provider)
    throw new Error('An EntityModel needs a provider');
};

/**
 * Gets a single entity by its id.
 *
 * @method getOne
 * @async
 * @param {String} id The entity id
 * @param {Function} callback The function to call when it's done
 *   - **Error** The error if an error occurred, null otherwise
 *   - **Object** The entity
 */
EntityModel.prototype.getOne = function(id, callback) {
  this.provider.getOne(id, callback);
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
EntityModel.prototype.get = function(callback) {
  this.provider.get(callback);
};

/**
 * Gets a list of filtered entities
 *
 * @param {type} callback
 * @returns {undefined}
 */
EntityModel.prototype.getByFilter = function(filter, callback) {
  this.provider.getByFilter(filter, callback);
};

/**
 * Gets a paginated list of filtered entities
 *
 * @param {type} filter
 * @param {type} count
 * @param {type} page
 * @param {type} sort
 * @param {boolean} populate
 * @param {type} callback
 * @returns {undefined}
 */
EntityModel.prototype.getPaginatedFilteredEntities = function(filter, count, page, sort, populate, callback) {
  // TODO change filter format to not directly do a DB call
  this.provider.getPaginatedFilteredEntities(filter, count, page, sort, callback);
};

/**
 * Adds a new entity.
 *
 * @method add
 * @async
 * @param {Object} data Entity data to store into the collection, its structure depends on the type of entity
 * @param {Function} callback The function to call when it's done
 *   - **Error** The error if an error occurred, null otherwise
 *   - **Object** The added entity
 */
EntityModel.prototype.add = function(data, callback) {
  data.id = String(Date.now());
  this.provider.add(data, function(error) {
    if (callback)
      callback(error, data);
  });
};

/**
 * Updates an entity.
 *
 * @method update
 * @async
 * @param {String} id The id of the entity to update
 * @param {Object} data Entity data, its structure depends on the type of entity
 * @param {Function} callback The function to call when it's done
 *   - **Error** The error if an error occurred, null otherwise
 *   - **Number** The number of updated items
 */
EntityModel.prototype.update = function(id, data, callback) {
  this.provider.update(id, data, callback);
};

/**
 * Removes an entity.
 *
 * @method remove
 * @async
 * @param {String} id The id of the entity to remove
 * @param {Function} callback The function to call when it's done
 *   - **Error** The error if an error occurred, null otherwise
 *   - **Number** The number of removed items
 */
EntityModel.prototype.remove = function(id, callback) {
  this.provider.remove(id, callback);
};
