'use strict';

/**
 * Databases implementations.
 *
 *     // Load module "database"
 *     var database = require('@openveo/api').database;
 *
 * @module database
 * @main database
 */

module.exports.factory = process.requireApi('lib/database/factory.js');
module.exports.Database = process.requireApi('lib/database/Database.js');
