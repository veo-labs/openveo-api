'use strict';

/**
 * Storages hold different ways of storing a resource.
 *
 * A storage is capable of performing CRUD (Create Read Update Delete) operations to manage a set of
 * resources. A storage doesn't have any knowledge about the resource, it just stores it.
 *
 * @example
 * // Load module "storages"
 * var storage = require('@openveo/api').storages;
 *
 * @module storages
 * @property {module:storages/Storage} Storage Storage module
 * @property {module:storages/Database} Database Database module
 * @property {module:storages/ResourceFilter} ResourceFilter ResourceFilter module
 * @property {module:storages/factory} factory factory module
 * @property {module:storages/databaseErrors} databaseErrors databaseErrors module
 */

module.exports.Storage = process.requireApi('lib/storages/Storage.js');
module.exports.Database = process.requireApi('lib/storages/databases/Database.js');
module.exports.ResourceFilter = process.requireApi('lib/storages/ResourceFilter.js');
module.exports.factory = process.requireApi('lib/storages/factory.js');
module.exports.databaseErrors = process.requireApi('lib/storages/databases/databaseErrors.js');
