'use strict';

/**
 * @module controllers
 */

var util = require('util');
var Controller = process.requireApi('lib/controllers/Controller.js');
var errors = process.requireApi('lib/controllers/httpErrors.js');

/**
 * Defines base controller for all controllers which need to provide HTTP route actions for all requests
 * relative to entities.
 *
 *     // Implement an EntityController : "CustomEntityController"
 *     var util = require('util');
 *     var openVeoApi = require('@openveo/api');
 *
 *     function CustomEntityController(model, provider) {
 *       CustomEntityController.super_.call(this, model, provider);
 *     }
 *
 *     util.inherits(CustomEntityController, openVeoApi.controllers.EntityController);
 *
 * @class EntityController
 * @extends Controller
 * @constructor
 */
function EntityController() {
  EntityController.super_.call(this);
}

module.exports = EntityController;
util.inherits(EntityController, Controller);

/**
 * Gets the list of entities.
 *
 * @example
 *
 *     // Response example
 *     {
 *       "entities" : [ ... ]
 *     }
 *
 * @method getEntitiesAction
 * @async
 * @param {Request} request ExpressJS HTTP Request
 * @param {Response} response ExpressJS HTTP Response
 * @param {Function} next Function to defer execution to the next registered middleware
 */
EntityController.prototype.getEntitiesAction = function(request, response, next) {
  var model = this.getModel(request);

  model.get(null, function(error, entities) {
    if (error) {
      process.logger.error(error.message, {error: error, method: 'getEntitiesAction'});
      next(errors.GET_ENTITIES_ERROR);
    } else {
      response.send({
        entities: entities
      });
    }
  });
};

/**
 * Gets a specific entity.
 *
 * @example
 *
 *     // Response example
 *     {
 *       "entity" : { ... }
 *     }
 *
 * @method getEntityAction
 * @async
 * @param {Request} request ExpressJS HTTP Request
 * @param {Object} request.params Request's parameters
 * @param {String} request.params.id The entity id to retrieve
 * @param {Response} response ExpressJS HTTP Response
 * @param {Function} next Function to defer execution to the next registered middleware
 */
EntityController.prototype.getEntityAction = function(request, response, next) {
  if (request.params.id) {
    var entityId = request.params.id;
    var model = this.getModel(request);

    model.getOne(entityId, null, function(error, entity) {
      if (error) {
        process.logger.error(error.message, {error: error, method: 'getEntityAction', entity: entityId});
        next(errors.GET_ENTITY_ERROR);
      } else if (!entity) {
        process.logger.warn('Not found', {method: 'getEntityAction', entity: entityId});
        next(errors.GET_ENTITY_NOT_FOUND);
      } else {
        response.send({
          entity: entity
        });
      }
    });
  } else {

    // Missing id of the entity
    next(errors.GET_ENTITY_MISSING_PARAMETERS);

  }
};

/**
 * Updates an entity.
 *
 * @example
 *
 *     // Expected body example
 *     {
 *       // Entity's data
 *     }
 *
 * @method updateEntityAction
 * @async
 * @param {Request} request ExpressJS HTTP Request
 * @param {Object} request.params Request's parameters
 * @param {String} request.params.id The entity id to update
 * @param {Response} response ExpressJS HTTP Response
 * @param {Function} next Function to defer execution to the next registered middleware
 */
EntityController.prototype.updateEntityAction = function(request, response, next) {
  if (request.params.id && request.body) {
    var entityId = request.params.id;
    var model = this.getModel(request);

    model.update(entityId, request.body, function(error, updateCount) {
      if (error) {
        process.logger.error((error && error.message) || 'Fail updating',
                             {method: 'updateEntityAction', entity: entityId});
        next(errors.UPDATE_ENTITY_ERROR);
      } else {
        response.send({error: null, status: 'ok'});
      }
    });
  } else {

    // Missing id of the entity or the datas
    next(errors.UPDATE_ENTITY_MISSING_PARAMETERS);

  }
};

/**
 * Adds an entity.
 *
 * @example
 *
 *     // Expected body example
 *     {
 *       "entity" : { ... }
 *     }
 *
 * @method addEntityAction
 * @async
 * @param {Request} request ExpressJS HTTP Request
 * @param {Response} response ExpressJS HTTP Response
 * @param {Function} next Function to defer execution to the next registered middleware
 */
EntityController.prototype.addEntityAction = function(request, response, next) {
  if (request.body) {
    var model = this.getModel(request);

    model.add(request.body, function(error, insertCount, entity) {
      if (error) {
        process.logger.error(error.message, {error: error, method: 'addEntityAction'});
        next(errors.ADD_ENTITY_ERROR);
      } else {
        response.send({
          entity: entity
        });
      }
    });
  } else {

    // Missing body
    next(errors.ADD_ENTITY_MISSING_PARAMETERS);

  }
};

/**
 * Removes entities.
 *
 * @method removeEntityAction
 * @async
 * @param {Request} request ExpressJS HTTP Request
 * @param {Object} request.params Request's parameters
 * @param {String} request.params.id The comma separated list of entity ids to remove
 * @param {Response} response ExpressJS HTTP Response
 * @param {Function} next Function to defer execution to the next registered middleware
 */
EntityController.prototype.removeEntityAction = function(request, response, next) {
  if (request.params.id) {
    var arrayId = request.params.id.split(',');
    var model = this.getModel(request);

    model.remove(arrayId, function(error, deleteCount) {
      if (error) {
        process.logger.error(error.message, {error: error, method: 'removeEntityAction'});
        next(errors.REMOVE_ENTITY_ERROR);
      } else if (deleteCount != arrayId.length) {
        process.logger.error(deleteCount + '/' + arrayId.length + ' removed',
                             {method: 'removeEntityAction', ids: arrayId});
        next(errors.REMOVE_ENTITY_ERROR);
      } else {
        response.send({error: null, status: 'ok'});
      }
    });
  } else {

    // Missing id of the entity
    next(errors.REMOVE_ENTITY_MISSING_PARAMETERS);

  }
};

/**
 * Gets an instance of the entity model associated to the controller.
 *
 * @method getModel
 * @return {EntityModel} The entity model
 * @throws {Error} getModel not implemented for this EntityController
 */
EntityController.prototype.getModel = function() {
  throw new Error('getModel not implemented for this EntityController');
};
