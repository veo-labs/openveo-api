'use strict';

/**
 * @module database
 */

/**
 * Defines a factory to get an instance of a {{#crossLink "Database"}}{{/crossLink}}.
 *
 *     // Example on how to use a MongoDB database
 *     var openVeoApi = require('@openveo/api');
 *     var databaseConf = {
 *       type: 'mongodb', // Database type
 *       host: 'localhost', // MongoDB server host
 *       port: 27017, // MongoDB port
 *       database: 'DATABASE_NAME', // Replace DATABASE_NAME by the name of the OpenVeo database
 *       username: 'DATABASE_USER_NAME', // Replace DATABASE_USER_NAME by the name of the database user
 *       password: 'DATABASE_USER_PWD', // Replace DATABASE_USER_PWD  by the password of the database user
 *       replicaSet: 'REPLICA_SET_NAME', // Replace REPLICA_SET_NAME by the name of the ReplicaSet
 *       seedlist: 'IP_1:PORT_1,IP_2:PORT_2' // The comma separated list of secondary servers
 *     };
 *
 *     // Create a new instance of the database
 *     var db = openVeoApi.database.factory.get(databaseConf);
 *
 * @class factory
 * @static
 */

/**
 * Gets an instance of a Database client using the given database configuration.
 *
 * @method get
 * @static
 * @param {Object} databaseConf A database configuration object
 * @param {String} databaseConf.type The database type (only 'mongodb' is supported for now)
 * @return {Database} The database
 * @throws {TypeError} If database type is unknown
 */
module.exports.get = function(databaseConf) {
  if (databaseConf && databaseConf.type) {
    switch (databaseConf.type) {

      case 'mongodb':
        var MongoDatabase = process.requireApi('lib/database/mongodb/MongoDatabase.js');
        return new MongoDatabase(databaseConf);

      default:
        throw new TypeError('Unknown database type');
    }
  } else
    throw new TypeError('Invalid database configuration');
};
