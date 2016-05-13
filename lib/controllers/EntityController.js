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

    model.getOne(request.params.id, null, function(error, entity) {
      if (error) {
        next((error instanceof AccessError) ? errors.GET_ENTITY_FORBIDDEN : errors.GET_ENTITY_ERROR);
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

    model.update(request.params.id, request.body, function(error, modifyCount) {
      if (error && (error instanceof AccessError))
        next(errors.UPDATE_ENTITY_FORBIDDEN);
      else if (error) {

        // modifyCount is not tested
        // update one entity with itself will not fail but insertCount will return 0
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
      if (error || (deleteCount != arrayId.length)) {
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
