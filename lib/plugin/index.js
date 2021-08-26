'use strict';

/**
 * All elements necessary to create plugins or get information about them.
 *
 * @example
 * // Load module "plugin"
 * var plugin = require('@openveo/api').plugin;
 *
 * @module plugin
 * @property {module:plugin/Plugin} Plugin Plugin module
 * @property {module:plugin/PluginApi} PluginApi PluginApi module
 */

module.exports.Plugin = process.requireApi('lib/plugin/Plugin.js');
module.exports.PluginApi = process.requireApi('lib/plugin/PluginApi.js');
