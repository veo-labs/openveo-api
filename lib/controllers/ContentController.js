'use strict';

/**
 * @module controllers
 */

var util = require('util');
var errors = process.requireApi('lib/controllers/httpErrors.js');
var AccessError = process.requireApi('lib/errors/AccessError.js');
var EntityController = process.requireApi('lib/controllers/EntityController.js');

/**
 * Defines base controller for all controllers which need to provide HTTP route actions for all requests
 * relative to content entities.
 *
 *     // Implement a ContentController : "CustomContentController"
 *     var util = require('util');
 *     var openVeoApi = require('@openveo/api');
 *
 *     function CustomContentController() {
 *       CustomContentController.super_.call(this);
 *     }
 *
 *     util.inherits(CustomContentController, openVeoApi.controllers.ContentController);
 *
 * @class ContentController
 * @extends EntityController
 * @constructor
 * @throws {TypeError} An error if constructors are not as expected
 */
function ContentController() {
  ContentController.super_.call(this);
}

module.exports = ContentController;
util.inherits(ContentController, EntityController);

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
ContentController.prototype.getEntitiesAction = function(request, response, next) {
  var model = this.getModel(request);

  model.get(null, function(error, entities) {
    if (error) {
      process.logger.error(error.message, {error: error, method: 'getEntitiesAction'});
      next((error instanceof AccessError) ? errors.GET_ENTITIES_FORBIDDEN : errors.GET_ENTITIES_ERROR);
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
ContentController.prototype.getEntityAction = function(request, response, next) {
  if (request.params.id) {
    var entityId = request.params.id;
    var model = this.getModel(request);

    model.getOne(entityId, null, function(error, entity) {
      if (error) {
        process.logger.error(error.message, {error: error, method: 'getEntityAction', entity: entityId});
        next((error instanceof AccessError) ? errors.GET_ENTITY_FORBIDDEN : errors.GET_ENTITY_ERROR);
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
ContentController.prototype.updateEntityAction = function(request, response, next) {
  if (request.params.id && request.body) {
    var entityId = request.params.id;
    var model = this.getModel(request);

    model.update(entityId, request.body, function(error, updateCount) {
      if (error) {
        process.logger.error((error && error.message) || 'Fail updating',
                             {method: 'updateEntityAction', entity: entityId});
        next((error instanceof AccessError) ? errors.UPDATE_ENTITY_FORBIDDEN : errors.UPDATE_ENTITY_ERROR);
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
ContentController.prototype.addEntityAction = function(request, response, next) {
  if (request.body) {
    var model = this.getModel(request);

    model.add(request.body, function(error, insertCount, entity) {
      if (error) {
        process.logger.error(error.message, {error: error, method: 'addEntityAction'});
        next((error instanceof AccessError) ? errors.ADD_ENTITY_FORBIDDEN : errors.ADD_ENTITY_ERROR);
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
