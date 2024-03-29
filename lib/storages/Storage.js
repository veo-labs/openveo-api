'use strict';

/**
 * @module storages/Storage
 */

/**
 * Defines base storage for all storages.
 *
 * A storage is capable of performing CRUD (Create Read Update Delete) operations on resources.
 *
 * This should not be used directly, use one of its subclasses instead.
 *
 * @class Storage
 * @constructor
 * @param {Object} configuration Storage configuration which depends on the Storage type
 * @throws {TypeError} If configuration is missing
 */
function Storage(configuration) {
  if (Object.prototype.toString.call(configuration) !== '[object Object]')
    throw new TypeError('Storage configuration must be an Object');

  Object.defineProperties(this,

    /** @lends module:storages/Storage~Storage */
    {

      /**
       * The storage configuration.
       *
       * @type {Object}
       * @instance
       * @readonly
       */
      configuration: {
        value: configuration
      }

    }

  );

}

module.exports = Storage;

/**
 * Adds resources to the storage.
 *
 * @param {String} location The storage location where the resource will be added
 * @param {Array} resources The list of resources to store
 * @param {module:storages/Storage~Storage~addCallback} [callback] The function to call when it's done
 */
Storage.prototype.add = function(location, resources, callback) {
  throw new Error('add method not implemented for this Storage');
};

/**
 * Fetches resources from the storage.
 *
 * @param {String} location The storage location where to search for resources
 * @param {module:storages/ResourceFilter~ResourceFilter} [filter] Rules to filter resources
 * @param {Object} [fields] Expected resource fields to be included or excluded from the response, by default all
 * fields are returned. Only "exclude" or "include" can be specified, not both
 * @param {Array} [fields.include] The list of fields to include in the response, all other fields are excluded.
 * @param {Array} [fields.exclude] The list of fields to exclude from response, all other fields are included. Ignored
 * if include is also specified.
 * @param {Number} [limit] A limit number of resources to retrieve (10 by default)
 * @param {Number} [page] The page number started at 0 for the first page
 * @param {Object} [sort] The list of fields to sort by with the field name as key and the sort order as
 * value (e.g. {field1: 'asc', field2: 'desc'})
 * @param {module:storages/Storage~Storage~getCallback} callback The function to call when it's done
 */
Storage.prototype.get = function(location, filter, fields, limit, page, sort, callback) {
  throw new Error('get method not implemented for this Storage');
};

/**
 * Fetches a single resource from the storage.
 *
 * @param {String} location The storage location where to search for the resource
 * @param {module:storages/ResourceFilter~ResourceFilter} [filter] Rules to filter resources
 * @param {Object} [fields] Expected resource fields to be included or excluded from the response, by default all
 * fields are returned. Only "exclude" or "include" can be specified, not both
 * @param {Array} [fields.include] The list of fields to include in the response, all other fields are excluded
 * @param {Array} [fields.exclude] The list of fields to exclude from response, all other fields are included. Ignored
 * if include is also specified.
 * @param {module:storages/Storage~Storage~getOneCallback} callback The function to call when it's done
 */
Storage.prototype.getOne = function(location, filter, fields, callback) {
  throw new Error('getOne method not implemented for this Storage');
};

/**
 * Updates a resource in the storage.
 *
 * @param {String} location The storage location where to find the resource to update
 * @param {module:storages/ResourceFilter~ResourceFilter} filter Rules to filter the resource to update
 * @param {Object} data The modifications to perform
 * @param {module:storages/Storage~Storage~updateOneCallback} [callback] The function to call when it's done
 */
Storage.prototype.updateOne = function(location, filter, data, callback) {
  throw new Error('updateOne method not implemented for this Storage');
};

/**
 * Removes resources from the storage.
 *
 * @param {String} location The storage location where to find the resources to remove
 * @param {module:storages/ResourceFilter~ResourceFilter} filter Rules to filter resources to remove
 * @param {module:storages/Storage~Storage~removeCallback} [callback] The function to call when it's done
 */
Storage.prototype.remove = function(location, filter, callback) {
  throw new Error('remove method not implemented for this Storage');
};

/**
 * Removes a field from resources of a storage location.
 *
 * @param {String} location The storage location where to find the resources
 * @param {String} field The field to remove from resources
 * @param {module:storages/ResourceFilter~ResourceFilter} [filter] Rules to filter resources to update
 * @param {module:storages/Storage~Storage~removeFieldCallback} [callback] The function to call when it's done
 */
Storage.prototype.removeField = function(location, field, filter, callback) {
  throw new Error('removeField method not implemented for this Storage');
};

/**
 * @callback module:storages/Storage~Storage~addCallback
 * @param {(Error|null)} error The error if an error occurred, null otherwise
 * @param {(Number|Undefined)} total The total amount of resources inserted
 * @param {(Array|Undefined)} resources The list of inserted resources
 */

/**
 * @callback module:storages/Storage~Storage~getCallback
 * @param {(Error|null)} error The error if an error occurred, null otherwise
 * @param {(Array|Undefined)} resources The list of retrieved resources
 * @param {(Object|Undefined)} pagination Pagination information
 * @param {(Number|Undefined)} pagination.limit The specified limit
 * @param {(Number|Undefined)} pagination.page The actual page
 * @param {(Number|Undefined)} pagination.pages The total number of pages
 * @param {(Number|Undefined)} pagination.size The total number of resources
 */

/**
 * @callback module:storages/Storage~Storage~getOneCallback
 * @param {(Error|null)} error The error if an error occurred, null otherwise
 * @param {(Object|Undefined)} resource The resource
 */

/**
 * @callback module:storages/Storage~Storage~updateOneCallback
 * @param {(Error|null)} error The error if an error occurred, null otherwise
 * @param {(Number|Undefined)} 1 if everything went fine
 */

/**
 * @callback module:storages/Storage~Storage~removeCallback
 * @param {(Error|null)} error The error if an error occurred, null otherwise
 * @param {(Number|Undefined)} The number of removed resources
 */

/**
 * @callback module:storages/Storage~Storage~removeFieldCallback
 * @param {(Error|null)} error The error if an error occurred, null otherwise
 * @param {(Number|Undefined)} The number of updated resources
 */
