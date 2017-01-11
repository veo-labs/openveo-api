'use strict';

/**
 * @module plugin
 */

var Plugin = process.requireApi('lib/plugin/Plugin.js');

/**
 * Exposes functions to store information about loaded plugins.
 *
 * Use it to get information about plugins.
 *
 *     var openVeoApi = require('@openveo/api');
 *     var pluginManager = openVeoApi.plugin.pluginManager;
 *
 *     console.log(pluginManager.getPlugin('my-plugin'));
 *     console.log(pluginManager.getPlugins());
 *
 * @class pluginManager
 * @static
 */

// The list of plugins with complete information
var plugins = [];

/**
 * Gets a plugin by its name.
 *
 * @method getPlugin
 * @static
 * @param {String} name The plugin's name
 * @return {Plugin} The plugin
 */
module.exports.getPlugin = function(name) {
  if (name) {
    for (var i = 0; i < plugins.length; i++) {
      if (plugins[i].name === name)
        return plugins[i];
    }
  }

  return null;
};

/**
 * Gets the list of loaded plugins.
 *
 * @method getPlugins
 * @static
 * @return {Array} The list of loaded plugins
 */
module.exports.getPlugins = function() {
  return plugins;
};

/**
 * Adds a plugin to the list of plugins.
 *
 * @method addPlugin
 * @param {Plugin} plugin The plugin to add
 * @throws {TypeError} If plugin is not a valid plugin
 */
module.exports.addPlugin = function(plugin) {
  if (plugin instanceof Plugin && plugin.name) {
    if (!this.getPlugin(plugin.name)) {
      Object.freeze(plugin);
      plugins.push(plugin);
    }
  } else
    throw new TypeError('Could not add the plugin : invalid plugin');
};

/**
 * Adds several plugins to the list of plugins.
 *
 * @method addPlugins
 * @static
 * @param {Array} pluginsToAdd The list of plugins
 * @throws {TypeError} If one of the plugin is not a valid plugin
 */
module.exports.addPlugins = function(pluginsToAdd) {
  pluginsToAdd.forEach(this.addPlugin);
};

/**
 * Removes a plugin from the list of plugins.
 *
 * This won't unload the plugin in any maner.
 *
 * @method removePlugin
 * @static
 * @param {String} name The plugin's name
 */
module.exports.removePlugin = function(name) {
  var index = -1;

  for (var i = 0; i < plugins.length; i++) {
    if (plugins[i].name === name)
      index = i;
  }

  if (index > -1)
    plugins.splice(index, 1);
};
