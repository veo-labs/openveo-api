'use strict';

/**
 * @module storages
 */

/**
 * Defines a factory to get an instance of a {{#crossLink "Storage"}}{{/crossLink}}.
 *
 *     // Create a new Storage instance
 *     var db = openVeoApi.storages.factory.get('mongodb', mongoDbConfiguration);
 *
 * @class factory
 * @static
 */

/**
 * Gets a Storage instance.
 *
 * @method get
 * @static
 * @param {String} type The expected storage type, could be "mongodb"
 * @param {Object} configuration A storage configuration object which depends on the storage type
 * @return {Storage} The Storage instance
 * @throws {TypeError} If the specified storage type does not exist
 */
module.exports.get = function(type, configuration) {
  switch (type) {

    case 'mongodb':
      var MongoDatabase = process.requireApi('lib/storages/databases/mongodb/MongoDatabase.js');
      return new MongoDatabase(configuration);

    default:
      throw new TypeError('Unknown Storage type');
  }
};
