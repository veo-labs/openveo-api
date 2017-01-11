'use strict';

/**
 * @module models
 */

var util = require('util');
var shortid = require('shortid');
var EntityProvider = process.requireApi('lib/providers/EntityProvider.js');
var Model = process.requireApi('lib/models/Model.js');

/**
 * Defines a base model for all models which need to provide basic
 * CRUD (**C**reate **R**ead **U**pdate **D**elete) operations on entities.
 *
 * Each entity as it's own associated Model (extending EntityModel).
 *
 *     // Implement EntityModel : "CustomEntityModel"
 *     var util = require('util');
 *     var openVeoApi = require('@openveo/api');
 *
 *     function CustomEntityModel(provider) {
 *       CustomEntityModel.super_.call(this, provider);
 *     }
 *
 *     util.inherits(CustomEntityModel, openVeoApi.models.EntityModel);
 *
 *     // Use CustomEntityModel
 *     var coreApi = openVeoApi.api.getCoreApi();
 *     var CustomEntityProvider = process.require('CustomEntityProvider.js');
 *
 *     var model = new CustomEntityModel(new CustomEntityProvider(coreApi.getDatabase()));
 *
 * @class EntityModel
 * @extends Model
 * @constructor
 * @param {EntityProvider} provider The entity provider
 * @throws {TypeError} If provider is not an {{#crossLink "EntityProvider"}}{{/crossLink}}
 */
function EntityModel(provider) {
  Object.defineProperties(this, {

    /**
     * Provider associated to the model.
     *
     * @property provider
     * @type EntityProvider
     * @final
     */
    provider: {value: provider}

  });

  if (!(this.provider instanceof EntityProvider))
    throw new TypeError('An EntityModel needs an EntityProvider');

  EntityModel.super_.call(this, provider);
}

module.exports = EntityModel;
util.inherits(EntityModel, Model);

/**
 * Gets a single entity by its id.
 *
 * @method getOne
 * @async
 * @param {String} id The entity id
 * @param {Object} filter A MongoDB filter
 * @param {Function} callback The function to call when it's done
 *   - **Error** The error if an error occurred, null otherwise
 *   - **Object** The entity
 */
EntityModel.prototype.getOne = function(id, filter, callback) {
  this.provider.getOne(id, filter, callback);
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
EntityModel.prototype.get = function(filter, callback) {
  this.provider.get(filter, callback);
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
 * @param {Boolean} [populate] true to automatically populate results with additional information
 * @param {Function} callback The function to call when it's done
 *   - **Error** The error if an error occurred, null otherwise
 *   - **Array** The list of entities
 *   - **Object** Pagination information
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
 *   - **Number** The total amount of items inserted
 *   - **Object** The added entity
 */
EntityModel.prototype.add = function(data, callback) {
  data.id = data.id || shortid.generate();
  this.provider.add(data, function(error, insertCount, documents) {
    if (callback) {
      if (error)
        callback(error);
      else
        callback(null, insertCount, documents[0]);
    }
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
 * Removes one or several entities.
 *
 * @method remove
 * @async
 * @param {String|Array} ids Id(s) of the document(s) to remove from the collection
 * @param {Function} callback The function to call when it's done
 *   - **Error** The error if an error occurred, null otherwise
 *   - **Number** The number of deleted entities
 */
EntityModel.prototype.remove = function(ids, callback) {
  this.provider.remove(ids, callback);
};
