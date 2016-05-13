'use strict';

/**
 * @module controllers
 */

var util = require('util');
var Controller = process.requireAPI('lib/controllers/Controller.js');
var AccessError = process.requireAPI('lib/errors/AccessError.js');
var errors = process.requireAPI('lib/controllers/httpErrors.js');

/**
 * Provides route actions for all requests relative to entities.
 *
 * @class EntityController
 * @constructor
 * @extends Controller
 * @param {Function} Entity An entity function extending EntityModel
 */
function EntityController(Entity) {
  Controller.call(this);

  if (!Entity)
    throw new Error('EntityController requires an Entity function');

  this.Entity = Entity;
}

module.exports = EntityController;
util.inherits(EntityController, Controller);

/**
 * Gets a list of entities.
 *
 * @example
 *     {
 *       "entities" : [ ... ]
 *     }
 *
 * @method getEntitiesAction
 */
EntityController.prototype.getEntitiesAction = function(request, response, next) {
  var model = new this.Entity(request.user);

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
 * Expects the following url parameters :
 *  - **id** The id of the entity to retrieve
 *
 * @example
 *     {
 *       "entity" : { ... }
 *     }
 *
 * @method getEntityAction
 */
EntityController.prototype.getEntityAction = function(request, response, next) {
  if (request.params.id) {
    var model = new this.Entity(request.user);
    var entityId = request.params.id;

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
 * Expects the following url parameters :
 *  - **id** The id of the entity to update
 *
 * Also expects data in body.
 *
 * @method updateEntityAction
 */
EntityController.prototype.updateEntityAction = function(request, response, next) {
  if (request.params.id && request.body) {
    var model = new this.Entity(request.user);
    var entityId = request.params.id;

    model.update(entityId, request.body, function(error, updateCount) {
      if (error && (error instanceof AccessError))
        next(errors.UPDATE_ENTITY_FORBIDDEN);
      else if (error) {
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
 * Also expects entity data in body.
 *
 * @example
 *     {
 *       "entity" : { ... }
 *     }
 *
 * @method addEntityAction
 */
EntityController.prototype.addEntityAction = function(request, response, next) {
  if (request.body) {
    var model = new this.Entity(request.user);

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

/**
 * Removes an entity.
 *
 * Expects the following url parameters :
 *  - **id** The id of the entity to remove
 *
 * @method removeEntityAction
 */
EntityController.prototype.removeEntityAction = function(request, response, next) {
  if (request.params.id) {
    var model = new this.Entity(request.user);

    var arrayId = request.params.id.split(',');
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
