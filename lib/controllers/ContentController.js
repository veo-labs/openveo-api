'use strict';

/**
 * @module controllers
 */

var util = require('util');
var utilExt = process.requireApi('lib/util.js');
var errors = process.requireApi('lib/controllers/httpErrors.js');
var EntityController = process.requireApi('lib/controllers/EntityController.js');
var ResourceFilter = process.requireApi('lib/storages/ResourceFilter.js');

/**
 * Defines base controller for all controllers which need to provide HTTP route actions for all requests
 * relative to content entities.
 *
 * A content entity is an entity owned by a user, consequently user must be authenticated to use ContentController
 * actions. Content entities which belong to the anonymous user can be manipulated by all. Content entities which
 * belong to a particular user can be manipulated by this particular user, the super administrator, the entity manager,
 * and, if entity is inside a group, by all users which have enough privileges on this group.
 *
 * The authenticated user must have the following properties:
 * - **String** id The user id
 * - **Array** permissions An array of permissions in the following format: OPERATION-group-GROUP_ID, where OPERATION
 * is one of ContentController.OPERATIONS and GROUP_ID the id of a group (e.g.
 * ['get-group-Jekrn20Rl', 'update-group-Jekrn20Rl', 'delete-group-YldO3Jie3'])
 *
 * A content entity has a "metadata" property with:
 * - **String** user The id of the content entity owner
 * - **Array** groups The list of groups associated to the content entity
 *
 * @class ContentController
 * @extends EntityController
 * @constructor
 */
function ContentController() {
  ContentController.super_.call(this);
}

module.exports = ContentController;
util.inherits(ContentController, EntityController);

// Operations on content entities

/**
 * The list of operations used to manage privileges of a user.
 *
 * @property OPERATIONS
 * @type Object
 * @final
 * @static
 */
ContentController.OPERATIONS = {
  READ: 'get',
  UPDATE: 'update',
  DELETE: 'delete'
};
Object.freeze(ContentController.OPERATIONS);

/**
 * Gets user permissions by groups.
 *
 * @example
 *
 *     // Example of user permissions
 *     ['get-group-Jekrn20Rl', 'update-group-Jekrn20Rl', 'delete-group-YldO3Jie3']
 *
 *     // Example of returned groups
 *     {
 *       'Jekrn20Rl': ['get', 'update'], // User only has get / update permissions on group 'Jekrn20Rl'
 *       'YldO3Jie3': ['delete'], // User only has delete permission on group 'YldO3Jie3'
 *       ...
 *     }
 *
 * @method getUserGroups
 * @private
 * @param {Object} user The user to extract groups from
 * @return {Object} Groups organized by ids
 */
function getUserGroups(user) {
  var groups = {};

  if (user && user.permissions) {
    user.permissions.forEach(function(permission) {
      var reg = new RegExp('^(get|update|delete)-group-(.+)$');
      var permissionChunks = reg.exec(permission);
      if (permissionChunks) {
        var operation = permissionChunks[1];
        var groupId = permissionChunks[2];

        if (!groups[groupId])
          groups[groupId] = [];

        groups[groupId].push(operation);
      }
    });
  }

  return groups;
}

/**
 * Gets the list of groups of a user, with authorization on a certain operation.
 *
 * All user groups with authorization on the operation are returned.
 *
 * @method getUserAuthorizedGroups
 * @private
 * @param {Object} user The user
 * @param {String} operation The operation (get, update or delete)
 * @return {Array} The list of user groups which have authorization on the given operation
 */
function getUserAuthorizedGroups(user, operation) {
  var userGroups = getUserGroups(user);
  var groups = [];

  for (var groupId in userGroups) {
    if (userGroups[groupId].indexOf(operation) >= 0)
      groups.push(groupId);
  }

  return groups;
}

/**
 * Gets entities.
 *
 * If user does not have enough privilege to read a particular entity, the entity is not listed in the response.
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
 * @param {Object} request.query Request query
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
ContentController.prototype.getEntitiesAction = function(request, response, next) {
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
    this.addAccessFilter(null, request.user),
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
 * User must have permission to read the entity.
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
ContentController.prototype.getEntityAction = function(request, response, next) {
  if (request.params.id) {
    var entityId = request.params.id;
    var provider = this.getProvider();
    var self = this;
    var fields;
    request.query = request.query || {};

    try {
      fields = utilExt.shallowValidateObject(request.query, {
        include: {type: 'array<string>'},
        exclude: {type: 'array<string>'}
      });
    } catch (error) {
      return next(errors.GET_ENTITY_WRONG_PARAMETERS);
    }

    // Make sure "metadata" field is not excluded
    fields = this.removeMetatadaFromFields(fields);

    provider.getOne(
      new ResourceFilter().equal('id', entityId),
      fields,
      function(error, entity) {
        if (error) {
          process.logger.error(error.message, {error: error, method: 'getEntityAction', entity: entityId});
          next(errors.GET_ENTITY_ERROR);
        } else if (!entity) {
          process.logger.warn('Not found', {method: 'getEntityAction', entity: entityId});
          next(errors.GET_ENTITY_NOT_FOUND);
        } else if (!self.isUserAuthorized(request.user, entity, ContentController.OPERATIONS.READ)) {
          process.logger.error(
            'User "' + request.user.id + '" doesn\'t have access to entity "' + entityId + '"',
            {method: 'getEntityAction'}
          );
          next(errors.GET_ENTITY_FORBIDDEN);
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
 * User must have permission to update the entity. If user doesn't have permission to update the entity an
 * HTTP forbidden error will be sent as response.
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
 * @param {Array} [request.body.groups] The list of groups the content entity belongs to
 * @param {String} [request.body.user] The id of the entity owner. Only the owner can modify the entity owner.
 * @param {Response} response ExpressJS HTTP Response
 * @param {Function} next Function to defer execution to the next registered middleware
 */
ContentController.prototype.updateEntityAction = function(request, response, next) {
  if (request.params.id && request.body) {
    var self = this;
    var entityId = request.params.id;
    var provider = this.getProvider();
    var data = request.body;
    var metadatas;

    try {
      metadatas = utilExt.shallowValidateObject(request.body, {
        groups: {type: 'array<string>'},
        user: {type: 'string'}
      });
    } catch (error) {
      return next(errors.UPDATE_ENTITY_WRONG_PARAMETERS);
    }

    if (metadatas.groups) {
      data['metadata.groups'] = data.groups.filter(function(group) {
        return group ? true : false;
      });
    }

    if (metadatas.user) data['metadata.user'] = data.user;

    // Get information on the entity which is about to be updated to validate that the user has enough permissions
    // to update it
    provider.getOne(
      new ResourceFilter().equal('id', entityId),
      {
        include: ['id', 'metadata']
      },
      function(error, entity) {
        if (error) return next(errors.UPDATE_ENTITY_GET_ONE_ERROR);
        if (!entity) return next(errors.UPDATE_ENTITY_NOT_FOUND_ERROR);

        // Make sure user is authorized to modify all the entities
        if (self.isUserAuthorized(request.user, entity, ContentController.OPERATIONS.UPDATE)) {

          // User has permission to update this entity

          // User is authorized to update the entity but he must be owner to update the owner
          if (!self.isUserOwner(entity, request.user) &&
              !self.isUserAdmin(request.user) &&
              !self.isUserManager(request.user)) {
            delete data['user'];
          }

          provider.updateOne(new ResourceFilter().equal('id', entity.id), data, function(error, total) {
            if (error) {
              process.logger.error(error.message || 'Fail updating',
                                   {method: 'updateEntityAction', entity: entityId});
              next(errors.UPDATE_ENTITY_ERROR);
            } else if (!total) {
              process.logger.error('The entity could not be updated',
                                   {method: 'updateEntityAction', entity: entityId});
              next(errors.UPDATE_ENTITY_FORBIDDEN);
            } else {
              response.send({total: total});
            }
          });
        } else {
          process.logger.error('The entity could not be updated', {method: 'updateEntityAction', entity: entityId});
          next(errors.UPDATE_ENTITY_FORBIDDEN);
        }

      }
    );

  } else {

    // Missing entity id or the datas
    next(errors.UPDATE_ENTITY_MISSING_PARAMETERS);

  }
};

/**
 * Adds entities.
 *
 * Information about the user (which becomes the owner) is automatically added to the entities.
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
 * @param {Array} [request.body.groups] The list of groups the content entities belong to
 * @param {Response} response ExpressJS HTTP Response
 * @param {Function} next Function to defer execution to the next registered middleware
 */
ContentController.prototype.addEntitiesAction = function(request, response, next) {
  if (request.body) {
    var provider = this.getProvider();
    var parsedRequest;
    var datas;

    try {
      parsedRequest = utilExt.shallowValidateObject(request, {
        body: {type: 'array<object>', required: true}
      });
    } catch (error) {
      return next(errors.ADD_ENTITIES_WRONG_PARAMETERS);
    }

    // Set common content entities information
    datas = parsedRequest.body;
    datas.forEach(function(data) {
      data.metadata = {
        user: request.user && request.user.id,
        groups: data.groups || []
      };
    });

    provider.add(datas, function(error, total, entities) {
      if (error) {
        process.logger.error(error.message, {error: error, method: 'addEntitiesAction'});
        next(errors.ADD_ENTITIES_ERROR);
      } else
        response.send({entities: entities, total: total});
    });
  } else {

    // Missing body
    next(errors.ADD_ENTITIES_MISSING_PARAMETERS);

  }
};

/**
 * Removes entities.
 *
 * User must have permission to remove the entities. If user doesn't have permission to remove a particular entity an
 * HTTP forbidden error will be sent as response and there won't be any guarantee on the number of removed entities.
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
ContentController.prototype.removeEntitiesAction = function(request, response, next) {
  if (request.params.id) {
    var self = this;
    var entityIds = request.params.id.split(',');
    var entityIdsToRemove = [];
    var provider = this.getProvider();

    // Get information on entities which are about to be removed to validate that the user has enough permissions
    // to do it
    provider.get(
      new ResourceFilter().in('id', entityIds),
      {
        include: ['id', 'metadata']
      },
      entityIds.length,
      null,
      null,
      function(error, entities, pagination) {

        // Make sure user is authorized to modify all the entities
        entities.forEach(function(entity) {
          if (self.isUserAuthorized(request.user, entity, ContentController.OPERATIONS.DELETE))
            entityIdsToRemove.push(entity.id);
        });

        provider.remove(new ResourceFilter().in('id', entityIdsToRemove), function(error, total) {
          if (error) {
            process.logger.error(error.message, {error: error, method: 'removeEntitiesAction'});
            next(errors.REMOVE_ENTITIES_ERROR);
          } else if (total != entityIdsToRemove.length) {
            process.logger.error(total + '/' + entityIds.length + ' removed',
                                 {method: 'removeEntitiesAction', entities: entityIdsToRemove});
            next(errors.REMOVE_ENTITIES_ERROR);
          } else if (entityIdsToRemove.length !== entityIds.length) {
            process.logger.error(
              'Some entities could not be removed',
              {method: 'removeEntitiesAction', entities: entityIds, removedEntities: entityIdsToRemove}
            );
            next(errors.REMOVE_ENTITIES_FORBIDDEN);
          } else {
            response.send({total: total});
          }
        });

      }
    );

  } else {

    // Missing entity ids
    next(errors.REMOVE_ENTITIES_MISSING_PARAMETERS);

  }
};

/**
 * Adds access rules to the given filter reference.
 *
 * Access rules make sure that content entities belong to the user (owner or in the same group).
 * If no filter is specified, a new filter is created.
 *
 * @method addAccessFilter
 * @param {ResourceFilter} [filter] The filter to add the access rules to
 * @param {Object} user The user information
 * @param {String} user.id The user id
 * @param {Array} user.permissions The user permissions
 * @return {ResourceFilter} The modified filter or a new one if no filter specified
 */
ContentController.prototype.addAccessFilter = function(filter, user) {
  if (user && !this.isUserAdmin(user) && !this.isUserManager(user)) {
    var userGroups = getUserAuthorizedGroups(user, ContentController.OPERATIONS.READ);

    if (!filter) filter = new ResourceFilter();

    filter.or([
      new ResourceFilter().in('metadata.user', [user.id, this.getAnonymousId()])
    ]);

    if (userGroups.length) {
      filter.or([
        new ResourceFilter().in('metadata.groups', userGroups)
      ]);
    }
  }

  return filter;
};

/**
 * Tests if user is the administrator.
 *
 * @method isUserAdmin
 * @param {Object} user The user to test
 * @param {String} user.id The user's id
 * @return {Boolean} true if the user is the administrator, false otherwise
 */
ContentController.prototype.isUserAdmin = function(user) {
  return user && user.id === this.getSuperAdminId();
};

/**
 * Tests if user is the anonymous user.
 *
 * @method isUserAnonymous
 * @param {Object} user The user to test
 * @param {String} user.id The user's id
 * @return {Boolean} true if the user is the anonymous, false otherwise
 */
ContentController.prototype.isUserAnonymous = function(user) {
  return user && user.id === this.getAnonymousId();
};

/**
 * Tests if user is the owner of a content entity.
 *
 * @method isUserOwner
 * @param {Object} entity The entity to test
 * @param {Object} entity.metadata Entity information about associated user and groups
 * @param {String} entity.metadata.user The id of the user the entity belongs to
 * @param {Object} user The user to test
 * @param {String} user.id The user's id
 * @return {Boolean} true if the user is the owner, false otherwise
 */
ContentController.prototype.isUserOwner = function(entity, user) {
  return user && entity.metadata && entity.metadata.user === user.id;
};

/**
 * Validates that a user is authorized to manipulate a content entity.
 *
 * User is authorized to manipulate the entity if one of the following conditions is met:
 *  - The entity belongs to the anonymous user
 *  - User is the super administrator
 *  - User is the owner of the entity
 *  - User has permission to manage contents
 *  - Entity has associated groups and user has permission to perform the operation on one of these groups
 *
 * @method isUserAuthorized
 * @param {Object} user The user
 * @param {String} user.id The user's id
 * @param {Array} user.permissions The user's permissions
 * @param {Object} entity The entity to manipulate
 * @param {Object} entity.metadata Entity information about associated user and groups
 * @param {String} entity.metadata.user The id of the user the entity belongs to
 * @param {Array} entity.metadata.groups The list of group ids the entity is part of
 * @param {String} operation The operation to perform on the entity
 * @return {Boolean} true if the user can manipulate the entity, false otherwise
 */
ContentController.prototype.isUserAuthorized = function(user, entity, operation) {
  if (this.isUserAdmin(user) ||
      this.isUserManager(user) ||
      this.isUserOwner(entity, user) ||
      (entity.metadata && this.isUserAnonymous({id: entity.metadata.user}))
  ) {
    return true;
  }
  if (entity.metadata && entity.metadata.groups) {
    var userGroups = getUserAuthorizedGroups(user, operation);
    return utilExt.intersectArray(entity.metadata.groups, userGroups).length;
  }

  return false;
};

/**
 * Removes "metadata" field from query fields.
 *
 * The "metadata" property of a content entity is used by ContentControllers to validate that a user
 * has enough privileges to perform an action. "metadata" property contains the id of the user the content property
 * belongs to and the list of groups the entity is part of.
 * Consequently "metadata" property has to be fetched by the provider when getting an entity, however we authorize the
 * user the exclude / include fields from provider response. removeMetadataFromFields makes sure "metadata" property
 * is not excluded from returned fields.
 *
 * @method removeMetatadaFromFields
 * @param {Object} fields The include and exclude fields
 * @param {Array} [fields.include] The list of fields to include which may contain a "metadata" property
 * @param {Array} [fields.exclude] The list of fields to exclude may contain a "metadata" property
 * @return {Object} The same fields object with new include and exclude arrays
 */
ContentController.prototype.removeMetatadaFromFields = function(fields) {
  if (fields.exclude) {
    fields.exclude = fields.exclude.filter(function(text) {
      return text.indexOf('metadata') < 0;
    });
  }

  if (fields.include) fields.include.push('metadata');

  return fields;
};

/**
 * Gets the id of the super administrator.
 *
 * It must be overriden by the sub class.
 *
 * @method getSuperAdminId
 * @return {String} The id of the super admin
 * @throw {Error} getSuperAdminId is not implemented
 */
ContentController.prototype.getSuperAdminId = function() {
  throw new Error('getSuperAdminId is not implemented for this ContentController');
};

/**
 * Gets the id of the anonymous user.
 *
 * It must be overriden by the sub class.
 *
 * @method getAnonymousId
 * @return {String} The id of the anonymous user
 * @throw {Error} getAnonymousId is not implemented
 */
ContentController.prototype.getAnonymousId = function() {
  throw new Error('getAnonymousId is not implemented for this ContentController');
};

/**
 * Tests if user is a contents manager.
 *
 * A contents manager can perform CRUD operations on content entities.
 * It must be overriden by the sub class.
 *
 * @method isUserManager
 * @param {Object} user The user to test
 * @param {Array} user.permissions The user's permissions
 * @return {Boolean} true if the user has permission to manage contents, false otherwise
 * @throw {Error} isUserManager is not implemented
 */
ContentController.prototype.isUserManager = function(user) {
  throw new Error('isUserManager is not implemented for this ContentController');
};
