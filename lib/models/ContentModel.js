'use strict';

/**
 * @module models
 */

var util = require('util');
var shortid = require('shortid');
var EntityModel = process.requireAPI('lib/models/EntityModel.js');
var applicationStorage = process.requireAPI('lib/applicationStorage.js');
var utilExt = process.requireAPI('lib/util.js');
var AccessError = process.requireAPI('lib/errors/AccessError.js');

/**
 * Gets the list of groups from a user.
 *
 * @example
 *
 *     // Example of user permissions
 *     ['get-group-Jekrn20Rl', 'update-group-Jekrn20Rl', 'delete-group-YldO3Jie3', 'some-other-permission']
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
 * @param {String} operation The operation (get, update or delete)
 * @return {Array} The list of user group ids with authorization on the operation
 */
function getUserAuthorizedGroups(operation) {
  var groups = [];

  for (var groupId in this.groups) {
    if (this.groups[groupId].indexOf(operation) >= 0)
      groups.push(groupId);
  }

  return groups;
}

/**
 * Defines a ContentModel class to manipulate content entities.
 *
 * A content entity associate a user to the entity and add controls for CRUD operations.
 *
 * ContentModel must not be used directly. Create a sub class instead.
 *
 * @example
 *
 *     // Example for implementing a new ContentModel named "CustomModel"
 *
 *     // CustomModel.js
 *
 *     var util = require('util');
 *     var api = require('@openveo/api');
 *     var CustomProvider = process.require('CustomProvider.js');
 *
 *     function CustomModel(user) {
 *
 *       // Initialize the content model with a dedicated provider
 *       api.ContentModel.call(this, user, new CustomProvider(api.applicationStorage.getDatabase()));
 *
 *     }
 *
 *     // CustomModel must extends ContentModel
 *     module.exports = CustomModel;
 *     util.inherits(CustomModel, api.ContentModel);
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
 * @class ContentModel
 * @constructor
 * @extends EntityModel
 * @param {Object} user The user that will manipulate the entities
 * @param {EntityProvider} provider The entity provider
 */
function ContentModel(user, provider) {
  EntityModel.call(this, provider);
  this.user = user;
  this.groups = getUserGroups(user);
}

module.exports = ContentModel;
util.inherits(ContentModel, EntityModel);

// Operations on entities
ContentModel.READ_OPERATION = 'get';
ContentModel.UPDATE_OPERATION = 'update';
ContentModel.DELETE_OPERATION = 'delete';

/**
 * Tests if user is the administrator.
 *
 * @method isUserAdmin
 * @return {Boolean} true if the user is the administrator, false otherwise
 */
ContentModel.prototype.isUserAdmin = function() {
  return this.user && this.user.id === applicationStorage.getSuperAdminId();
};

/**
 * Tests if user is the owner of a content entity.
 *
 * @method isUserOwner
 * @return {Boolean} true if the user is the owner, false otherwise
 */
ContentModel.prototype.isUserOwner = function(entity) {
  return entity.metadata && entity.metadata.user === this.user.id;
};

/**
 * Validates that the user is authorized to manipulate a content entity.
 *
 * User is authorized to manipulate the entity if one of the following conditions is met :
 *  - No user is associated to the model
 *  - The entity belongs to the anonymous user
 *  - User is the super administrator
 *  - User is the owner of the entity
 *  - Entity has associated groups and user has permission to perform the operation on the group
 *
 * @method isUserAuthorized
 * @param {Object} entity The entity to manipulate
 * @param {String} operation The operation to perform on the entity
 * @return {Boolean} true if the user can manipulate the entity, false otherwise
 */
ContentModel.prototype.isUserAuthorized = function(entity, operation) {
  if (this.isUserAdmin() ||
      this.isUserOwner(entity) ||
      !this.user ||
      (entity.metadata && entity.metadata.user === applicationStorage.getAnonymousUserId())
  ) {
    return true;
  }

  if (entity.metadata && entity.metadata.groups) {
    var userGroups = getUserAuthorizedGroups.call(this, operation);
    return utilExt.intersectArray(entity.metadata.groups, userGroups).length;
  }

  return false;
};

/**
 * Gets a single content entity by its id.
 *
 * If the user has not the necessary permissions, an error will be returned.
 *
 * @method getOne
 * @async
 * @param {String} id The entity id
 * @param {Object} filter A MongoDB filter
 * @param {Function} callback The function to call when it's done
 *   - **Error** The error if an error occurred, null otherwise
 *   - **Object** The entity
 */
ContentModel.prototype.getOne = function(id, filter, callback) {
  var self = this;
  this.provider.getOne(id, filter, function(error, entity) {
    if (!error && !self.isUserAuthorized(entity, ContentModel.READ_OPERATION)) {
      callback(new AccessError('User "' + self.user.id + '" doesn\'t have access to entity "' + id + '"'));
    } else
      callback(error, entity);
  });
};

/**
 * Gets all content entities.
 *
 * Only entities that the user can manipulate are returned.
 *
 * @method get
 * @async
 * @param {Object} filter A MongoDB filter
 * @param {Function} callback The function to call when it's done
 *   - **Error** The error if an error occurred, null otherwise
 *   - **Array** The list of entities
 */
ContentModel.prototype.get = function(filter, callback) {
  this.provider.get(this.addAccessFilter(filter), callback);
};

/**
 * Gets an ordered list of entities by page.
 *
 * Only entities that the user can manipulate are returned.
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
ContentModel.prototype.getPaginatedFilteredEntities = function(filter, count, page, sort, populate, callback) {
  this.provider.getPaginatedFilteredEntities(this.addAccessFilter(filter), count, page, sort, callback);
};

/**
 * Adds a new content entity.
 *
 * Information about the user (which becomes the owner) is added to the entity before recording.
 *
 * @method add
 * @async
 * @param {Object} data Entity data to store into the collection, its structure depends on the type of entity
 * @param {Function} callback The function to call when it's done
 *   - **Error** The error if an error occurred, null otherwise
 *   - **Number** The total amount of items inserted
 *   - **Object** The added entity
 */
ContentModel.prototype.add = function(data, callback) {
  data.metadata = {
    user: (this.user && this.user.id) || applicationStorage.getAnonymousUserId(),
    groups: data.groups || []
  };
  data.id = shortid.generate();
  this.provider.add(data, function(error, insertCount, documents) {
    if (callback)
      callback(error, insertCount, documents[0]);
  });
};

/**
 * Updates an entity.
 *
 * User must have permission to update the entity.
 *
 * @method update
 * @async
 * @param {String} id The id of the entity to update
 * @param {Object} data Entity data, its structure depends on the type of entity
 * @param {Function} callback The function to call when it's done
 *   - **Error** The error if an error occurred, null otherwise
 *   - **Number** The number of updated items
 */
ContentModel.prototype.update = function(id, data, callback) {
  var self = this;
  this.provider.getOne(id, null, function(error, entity) {
    if (!error) {
      if (self.isUserAuthorized(entity, ContentModel.UPDATE_OPERATION)) {

        // user is authorized to update but he must be owner to update owner
        if ((!self.isUserOwner(entity) && !self.isUserAdmin()) && data.metadata && data.metadata.user)
          delete data.metadata.user;
        self.provider.update(id, data, callback);
      } else
        callback(new AccessError('User "' + self.user.id + '" doesn\'t can`t update entity "' + id + '"'));
    } else
      callback(error);
  });
};

/**
 * Removes one or several entities.
 *
 * User must have permission to remove the entity.
 *
 * @method remove
 * @async
 * @param {String|Array} ids Id(s) of the document(s) to remove from the collection
 * @param {Function} callback The function to call when it's done
 *   - **Error** The error if an error occurred, null otherwise
 *   - **Number** The number of deleted entities
 */
ContentModel.prototype.remove = function(ids, callback) {
  var self = this;
  this.provider.get({id: {$in: ids}}, function(error, entities) {
    if (!error) {
      var idsToRemove = [];
      for (var i = 0; i < entities.length; i++) {
        if (self.isUserAuthorized(entities[i], ContentModel.DELETE_OPERATION))
          idsToRemove.push(entities[i].id);
      }

      self.provider.remove(idsToRemove, callback);

    } else
      callback(error);
  });
};

/**
 * Adds access rule to the given filter reference.
 *
 * @method addAccessFilter
 * @param {Object} filter The filter to add the access rule to
 * @return {Object} The filter
 */
ContentModel.prototype.addAccessFilter = function(filter) {
  if (!this.isUserAdmin() && this.user) {
    var userGroups = getUserAuthorizedGroups.call(this, ContentModel.READ_OPERATION);

    if (!filter)
      filter = {};

    if (!filter.$or)
      filter.$or = [];

    filter.$or.push({
      'metadata.user': {
        $in: [this.user.id, applicationStorage.getAnonymousUserId()]
      }
    });

    if (userGroups.length) {
      filter.$or.push({
        'metadata.groups': {
          $in: userGroups
        }
      });
    }
  }

  return filter;
};
