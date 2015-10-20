'use strict';

/**
 * Application storage is a global storage for core and plugins, to be
 * able to share information between both core and plugins.
 *
 * Information stored in the application storage must be limited.
 *
 * @module application-storage
 * @class applicationStorage
 * @main application-storage
 */

// Stores a bunch of information for all the application
var plugins;
var menu;
var database;
var scopes;
var entities;
var permissions;

/**
 * Gets the list of loaded openveo plugins.
 *
 * @example
 *
 *     var api = require('@openveo/api');
 *     api.applicationStorage.getPlugins();
 *
 * @method getPlugins
 * @return {Array} The list of loaded plugins
 */
module.exports.getPlugins = function() {
  return plugins;
};

/**
 * Sets the list of openveo plugins.
 *
 * @param {Array} subPlugins The list of plugins
 */
module.exports.setPlugins = function(subPlugins) {
  plugins = subPlugins;
};

/**
 * Gets the computed back office menu with all links.
 *
 * @example
 *
 *     var api = require('@openveo/api');
 *     api.applicationStorage.getMenu();
 *
 * @method getMenu
 * @return {Array} The list of back office links
 */
module.exports.getMenu = function() {
  return menu;
};

/**
 * Sets the back office menu list of links.
 *
 * @param {Array} newMenu The list of back office menu links
 */
module.exports.setMenu = function(newMenu) {
  menu = newMenu;
};

/**
 * Gets the current database instance.
 *
 * @example
 *
 *     var api = require('@openveo/api');
 *     api.applicationStorage.getDatabase();
 *
 * @method getDatabase
 * @return {Database} A Database object
 */
module.exports.getDatabase = function() {
  return database;
};

/**
 * Sets a new database instance as the current database.
 *
 * @param {Database} newDatabase The new database of the application
 */
module.exports.setDatabase = function(newDatabase) {
  database = newDatabase;
};

/**
 * Sets the web service list of scopes.
 *
 * @param {Object} newScopes The new list of scopes of the web service
 */
module.exports.setWebServiceScopes = function(newScopes) {
  scopes = newScopes;
};

/**
 * Gets the list of web service scopes defined by core and plugins.
 *
 * @example
 *
 *     var api = require('@openveo/api');
 *     api.applicationStorage.getWebServiceScopes();
 *
 * @method getWebServiceScopes
 * @return {Object} scopes
 */
module.exports.getWebServiceScopes = function() {
  return scopes;
};

/**
 * Sets the list of permissions.
 *
 * @param {Object} permissions The new list of permissions
 */
module.exports.setPermissions = function(newPermissions) {
  permissions = newPermissions;
};

/**
 * Gets the list of permissions defined by core and plugins.
 *
 * @example
 *
 *     var api = require('@openveo/api');
 *     api.applicationStorage.getPermissions();
 *
 * @method getPermissions
 * @return {Object} permissions
 */
module.exports.getPermissions = function() {
  return permissions;
};

/**
 * Sets the list of entities.
 *
 * @param {Object} newEntities The list of entities
 */
module.exports.setEntities = function(newEntities) {
  entities = newEntities;
};

/**
 * Gets the list of entities defined by both core and loaded plugins.
 *
 * @example
 *
 *     var api = require('@openveo/api');
 *     api.applicationStorage.getEntities();
 *
 * @method getEntities
 * @return {Object} entities
 */
module.exports.getEntities = function() {
  return entities;
};
