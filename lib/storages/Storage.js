'use strict';

/**
 * @module storages
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

  Object.defineProperties(this, {

    /**
     * The storage configuration.
     *
     * @property configuration
     * @type Object
     * @final
     */
    configuration: {
      value: configuration
    }

  });

}

module.exports = Storage;

/**
 * Adds resources to the storage.
 *
 * @method add
 * @async
 * @param {String} location The storage location where the resource will be added
 * @param {Array} resources The list of resources to store
 * @param {Function} [callback] The function to call when it's done
 *   - **Error** The error if an error occurred, null otherwise
 *   - **Number** The total amount of resources inserted
 *   - **Array** The list of inserted resources
 */
Storage.prototype.add = function(location, resources, callback) {
  throw new Error('add method not implemented for this Storage');
};

/**
 * Fetches resources from the storage.
 *
 * @method get
 * @async
 * @param {String} location The storage location where to search for resources
 * @param {ResourceFilter} [filter] Rules to filter resources
 * @param {Object} [fields] Expected resource fields to be included or excluded from the response, by default all
 * fields are returned. Only "exclude" or "include" can be specified, not both
 * @param {Array} [fields.include] The list of fields to include in the response, all other fields are excluded.
 * @param {Array} [fields.exclude] The list of fields to exclude from response, all other fields are included. Ignored
 * if include is also specified.
 * @param {Number} [limit] A limit number of resources to retrieve (10 by default)
 * @param {Number} [page] The page number started at 0 for the first page
 * @param {Object} [sort] The list of fields to sort by with the field name as key and the sort order as
 * value (e.g. {field1: 'asc', field2: 'desc'})
 * @param {Function} callback The function to call when it's done
 *   - **Error** The error if an error occurred, null otherwise
 *   - **Array** The list of retrieved resources
 *   - **Object** Pagination information
 *     - **Number** limit The specified limit
 *     - **Number** page The actual page
 *     - **Number** pages The total number of pages
 *     - **Number** size The total number of resources
 */
Storage.prototype.get = function(location, filter, fields, limit, page, sort, callback) {
  throw new Error('get method not implemented for this Storage');
};

/**
 * Fetches a single resource from the storage.
 *
 * @method getOne
 * @async
 * @param {String} location The storage location where to search for the resource
 * @param {ResourceFilter} [filter] Rules to filter resources
 * @param {Object} [fields] Expected resource fields to be included or excluded from the response, by default all
 * fields are returned. Only "exclude" or "include" can be specified, not both
 * @param {Array} [fields.include] The list of fields to include in the response, all other fields are excluded
 * @param {Array} [fields.exclude] The list of fields to exclude from response, all other fields are included. Ignored
 * if include is also specified.
 * @param {Function} callback The function to call when it's done
 *   - **Error** The error if an error occurred, null otherwise
 *   - **Object** The resource
 */
Storage.prototype.getOne = function(location, filter, fields, callback) {
  throw new Error('getOne method not implemented for this Storage');
};

/**
 * Updates a resource in the storage.
 *
 * @method updateOne
 * @async
 * @param {String} location The storage location where to find the resource to update
 * @param {ResourceFilter} filter Rules to filter the resource to update
 * @param {Object} data The modifications to perform
 * @param {Function} [callback] The function to call when it's done
 *   - **Error** The error if an error occurred, null otherwise
 *   - **Number** 1 if everything went fine
 */
Storage.prototype.updateOne = function(location, filter, data, callback) {
  throw new Error('updateOne method not implemented for this Storage');
};

/**
 * Removes resources from the storage.
 *
 * @method remove
 * @async
 * @param {String} location The storage location where to find the resources to remove
 * @param {ResourceFilter} filter Rules to filter resources to remove
 * @param {Function} [callback] The function to call when it's done
 *   - **Error** The error if an error occurred, null otherwise
 *   - **Number** The number of removed resources
 */
Storage.prototype.remove = function(location, filter, callback) {
  throw new Error('remove method not implemented for this Storage');
};

/**
 * Removes a field from resources of a storage location.
 *
 * @method removeField
 * @async
 * @param {String} location The storage location where to find the resources
 * @param {String} field The field to remove from resources
 * @param {ResourceFilter} [filter] Rules to filter resources to update
 * @param {Function} [callback] The function to call when it's done
 *   - **Error** The error if an error occurred, null otherwise
 *   - **Number** The number of updated resources
 */
Storage.prototype.removeField = function(location, field, filter, callback) {
  throw new Error('removeField method not implemented for this Storage');
};
