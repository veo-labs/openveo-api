'use strict';

/**
 * @module controllers
 */

var util = require('util');
var utilExt = process.requireApi('lib/util.js');
var HttpController = process.requireApi('lib/controllers/HttpController.js');
var ResourceFilter = process.requireApi('lib/storages/ResourceFilter.js');
var errors = process.requireApi('lib/controllers/httpErrors.js');

/**
 * Defines base controller for all controllers which need to provide HTTP route actions for all requests
 * relative to entities.
 *
 * @class EntityController
 * @extends HttpController
 * @constructor
 */
function EntityController() {
  EntityController.super_.call(this);
}

module.exports = EntityController;
util.inherits(EntityController, HttpController);

/**
 * Gets entities.
 *
 * @example
 *
 *     // Response example
 *     {
 *       "entities" : [ ... ],
 *       "pagination" : {
 *         "limit": ..., // The limit number of entities by page
 *         "page": ..., // The actual page
 *         "pages": ..., // The total number of pages
 *         "size": ... // The total number of entities
 *     }
 *
 * @method getEntitiesAction
 * @async
 * @param {Request} request ExpressJS HTTP Request
 * @param {Object} [request.query] Request query
 * @param {String|Array} [request.query.include] The list of fields to include from returned entities
 * @param {String|Array} [request.query.exclude] The list of fields to exclude from returned entities. Ignored if
 * include is also specified.
 * @param {Number} [request.query.limit] A limit number of entities to retrieve per page (default to 10)
 * @param {Number} [request.query.page] The page number started at 0 for the first page (default to 0)
 * @param {String} [request.query.sortBy] The entity field to sort by
 * @param {String} [request.query.sortOrder] Either "asc" for ascendant or "desc" for descendant
 * @param {Response} response ExpressJS HTTP Response
 * @param {Function} next Function to defer execution to the next registered middleware
 */
EntityController.prototype.getEntitiesAction = function(request, response, next) {
  var provider = this.getProvider();
  var sort = {};
  var query;
  request.query = request.query || {};

  try {
    query = utilExt.shallowValidateObject(request.query, {
      include: {type: 'array<string>'},
      exclude: {type: 'array<string>'},
      limit: {type: 'number', gt: 0, default: 10},
      page: {type: 'number', gte: 0, default: 0},
      sortBy: {type: 'string'},
      sortOrder: {type: 'string', in: ['asc', 'desc'], default: 'desc'}
    });
  } catch (error) {
    return next(errors.GET_ENTITIES_WRONG_PARAMETERS);
  }

  // Build sort description object
  if (query.sortBy && query.sortOrder) sort[query.sortBy] = query.sortOrder;

  provider.get(
    null,
    {
      exclude: query.exclude,
      include: query.include
    },
    query.limit,
    query.page,
    sort,
    function(error, entities, pagination) {
      if (error) {
        process.logger.error(error.message, {error: error, method: 'getEntitiesAction'});
        next(errors.GET_ENTITIES_ERROR);
      } else {
        response.send({
          entities: entities,
          pagination: pagination
        });
      }
    }
  );
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
 * @param {Object} request.params Request parameters
 * @param {String} request.params.id The entity id to retrieve
 * @param {Object} request.query Request query
 * @param {String|Array} [request.query.include] The list of fields to include from returned entity
 * @param {String|Array} [request.query.exclude] The list of fields to exclude from returned entity. Ignored if
 * include is also specified.
 * @param {Response} response ExpressJS HTTP Response
 * @param {Function} next Function to defer execution to the next registered middleware
 */
EntityController.prototype.getEntityAction = function(request, response, next) {
  if (request.params.id) {
    var entityId = request.params.id;
    var provider = this.getProvider();
    var query;
    request.query = request.query || {};

    try {
      query = utilExt.shallowValidateObject(request.query, {
        include: {type: 'array<string>'},
        exclude: {type: 'array<string>'}
      });
    } catch (error) {
      return next(errors.GET_ENTITY_WRONG_PARAMETERS);
    }

    provider.getOne(
      new ResourceFilter().equal('id', entityId),
      {
        exclude: query.exclude,
        include: query.include
      }, function(error, entity) {
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
      }
    );
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
 *     // Response example
 *     {
 *       "total": 1
 *     }
 *
 * @method updateEntityAction
 * @async
 * @param {Request} request ExpressJS HTTP Request
 * @param {Object} request.params Request parameters
 * @param {String} request.params.id The id of the entity to update
 * @param {Object} request.body The fields to update with their values
 * @param {Response} response ExpressJS HTTP Response
 * @param {Function} next Function to defer execution to the next registered middleware
 */
EntityController.prototype.updateEntityAction = function(request, response, next) {
  if (request.params.id && request.body) {
    var entityId = request.params.id;
    var provider = this.getProvider();

    provider.updateOne(
      new ResourceFilter().equal('id', entityId),
      request.body,
      function(error, total) {
        if (error) {
          process.logger.error(
            error.message || 'Fail updating',
            {method: 'updateEntityAction', entities: entityId}
          );
          next(errors.UPDATE_ENTITY_ERROR);
        } else {
          response.send({total: total});
        }
      }
    );
  } else {

    // Missing entity ids or the datas
    next(errors.UPDATE_ENTITY_MISSING_PARAMETERS);

  }
};

/**
 * Adds entities.
 *
 * @example
 *
 *     // Response example
 *     {
 *       "entities": [ ... ],
 *       "total": 42
 *     }
 *
 * @method addEntitiesAction
 * @async
 * @param {Request} request ExpressJS HTTP Request
 * @param {Array} request.body The list of entities to add with for each entity the fields with their values
 * @param {Response} response ExpressJS HTTP Response
 * @param {Function} next Function to defer execution to the next registered middleware
 */
EntityController.prototype.addEntitiesAction = function(request, response, next) {
  if (request.body) {
    var provider = this.getProvider(request);
    var parsedRequest;

    try {
      parsedRequest = utilExt.shallowValidateObject(request, {
        body: {type: 'array<object>', required: true}
      });
    } catch (error) {
      return next(errors.ADD_ENTITIES_WRONG_PARAMETERS);
    }

    provider.add(parsedRequest.body, function(error, total, entities) {
      if (error) {
        process.logger.error(error.message, {error: error, method: 'addEntitiesAction'});
        next(errors.ADD_ENTITIES_ERROR);
      } else {
        response.send({entities: entities, total: total});
      }
    });
  } else {

    // Missing body
    next(errors.ADD_ENTITIES_MISSING_PARAMETERS);

  }
};

/**
 * Removes entities.
 *
 * @example
 *
 *     // Response example
 *     {
 *       "total": 42
 *     }
 *
 * @method removeEntitiesAction
 * @async
 * @param {Request} request ExpressJS HTTP Request
 * @param {Object} request.params Request parameters
 * @param {String} request.params.id A comma separated list of entity ids to remove
 * @param {Response} response ExpressJS HTTP Response
 * @param {Function} next Function to defer execution to the next registered middleware
 */
EntityController.prototype.removeEntitiesAction = function(request, response, next) {
  if (request.params.id) {
    var entityIds = request.params.id.split(',');
    var provider = this.getProvider(request);

    provider.remove(
      new ResourceFilter().in('id', entityIds),
      function(error, total) {
        if (error) {
          process.logger.error(error.message, {error: error, method: 'removeEntitiesAction'});
          next(errors.REMOVE_ENTITIES_ERROR);
        } else if (total != entityIds.length) {
          process.logger.error(
            total + '/' + entityIds.length + ' removed',
            {method: 'removeEntitiesAction', entities: entityIds}
          );
          next(errors.REMOVE_ENTITIES_ERROR);
        } else {
          response.send({total: total});
        }
      }
    );
  } else {

    // Missing entity ids
    next(errors.REMOVE_ENTITIES_MISSING_PARAMETERS);

  }
};

/**
 * Gets an instance of the entity provider associated to the controller.
 *
 * @method getProvider
 * @return {EntityProvider} The entity provider
 * @throws {Error} getProvider not implemented for this EntityController
 */
EntityController.prototype.getProvider = function() {
  throw new Error('getProvider not implemented for this EntityController');
};
