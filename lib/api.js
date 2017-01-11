'use strict';

/**
 * Provides functions to get the API of a plugin.
 *
 *     // Load module "api"
 *     var api = require('@openveo/api').api;
 *
 * @module api
 * @main api
 * @class api
 * @static
 */

var pluginManager = process.requireApi('lib/plugin/pluginManager.js');

/**
 * Gets API of a plugin.
 *
 * @method getApi
 * @static
 * @param {String} name The plugin's name
 * @return {PluginApi} The plugin's API
 */
module.exports.getApi = function(name) {
  var plugin = pluginManager.getPlugin(name);
  return plugin ? plugin.api : null;
};

/**
 * Gets core plugin's API.
 *
 * @method getCoreApi
 * @static
 * @return {PluginApi} The core plugin's API
 */
module.exports.getCoreApi = function() {
  var plugin = pluginManager.getPlugin('core');
  return plugin ? plugin.api : null;
};
