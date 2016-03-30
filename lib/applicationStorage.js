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
var superAdminId;
var anonymousUserId;

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
 * @method setPlugins
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
 * @method setMenu
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
 * @method setDatabase
 * @param {Database} newDatabase The new database of the application
 */
module.exports.setDatabase = function(newDatabase) {
  database = newDatabase;
};

/**
 * Sets the web service list of scopes.
 *
 * @method setWebServiceScopes
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
 * @method setPermissions
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
 * @method setEntities
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

/**
 * Gets the id of the super administrator.
 *
 * @example
 *
 *     var api = require('@openveo/api');
 *     api.applicationStorage.getSuperAdminId();
 *
 * @method getSuperAdminId
 * @return {String} The super administrator id
 */
module.exports.getSuperAdminId = function() {
  return superAdminId;
};

/**
 * Sets the id of the super administrator.
 *
 * It can be set only once.
 *
 * @method setSuperAdminId
 * @param {String} id The id of the super administrator
 * @throws {Error} An error if super administrator id is already set
 */
module.exports.setSuperAdminId = function(id) {
  if (superAdminId === undefined)
    superAdminId = id;
  else
    throw new Error('Super administrator id can only be set once');
};

/**
 * Gets the id of the anonymous user.
 *
 * @example
 *
 *     var api = require('@openveo/api');
 *     api.applicationStorage.getAnonymousUserId();
 *
 * @method getAnonymousUserId
 * @return {String} The super administrator id
 */
module.exports.getAnonymousUserId = function() {
  return anonymousUserId;
};

/**
 * Sets the id of the anonymous user.
 *
 * It can be set only once.
 *
 * @method setAnonymousUserId
 * @param {String} id The id of the anonymous user
 * @throws {Error} An error if anonymous user id is already set
 */
module.exports.setAnonymousUserId = function(id) {
  if (anonymousUserId === undefined)
    anonymousUserId = id;
  else
    throw new Error('Anonymous user id can only be set once');
};
