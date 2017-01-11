'use strict';

/**
 * @module providers
 */

var Database = process.requireApi('lib/database/Database.js');

/**
 * Defines the base provider for all providers which need to manipulate datas
 * from a database.
 *
 *     // Implement a Provider named "CustomProvider"
 *     var util = require('util');
 *     var openVeoApi = require('@openveo/api');
 *
 *     function CustomProvider(database) {
 *       CustomProvider.super_.call(this, database, 'customCollection');
 *     }
 *
 *     util.inherits(CustomProvider, openVeoApi.providers.Provider);
 *
 * @class Provider
 * @constructor
 * @param {Database} database The database to use
 * @param {String} collection The database's collection
 * @throws {TypeError} If database and / or collection are not as expected
 */
function Provider(database, collection) {
  Object.defineProperties(this, {

    /**
     * The database to use.
     *
     * @property database
     * @type Database
     * @final
     */
    database: {value: database},

    /**
     * The database's collection's name.
     *
     * @property collection
     * @type String
     * @final
     */
    collection: {value: collection}

  });

  if (!this.collection)
    throw new TypeError('A Provider needs a collection');

  if (!(this.database instanceof Database))
    throw new TypeError('Database must be of type Database');
}

module.exports = Provider;
