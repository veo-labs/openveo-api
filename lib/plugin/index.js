'use strict';

/**
 * All elements necessary to create plugins or get information about them.
 *
 *     // Load module "plugin"
 *     var plugin = require('@openveo/api').plugin;
 *
 * @module plugin
 * @main plugin
 */

module.exports.Plugin = process.requireApi('lib/plugin/Plugin.js');
module.exports.PluginApi = process.requireApi('lib/plugin/PluginApi.js');
module.exports.pluginManager = process.requireApi('lib/plugin/pluginManager.js');
