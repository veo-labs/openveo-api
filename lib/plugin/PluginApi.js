'use strict';

/**
 * @module plugin
 */

/**
 * Defines a base plugin API for all plugins' which need to expose an API.
 *
 *     // Implement a PluginApi : "MyPluginApi"
 *     // for a plugin named "my-plugin"
 *
 *     var util = require('util');
 *     var openVeoApi = require('@openveo/api');
 *
 *     function MyPluginApi() {
 *       MyPluginApi.super_.call(this);
 *     }
 *
 *     util.inherits(MyPluginApi, openVeoApi.plugin.PluginApi);
 *
 *     // Associate the API to the plugin when creating it
 *     function MyPlugin() {
 *       MyPlugin.super_.call(this);
 *
 *       // Exposes MyPlugin's APIs
 *       this.api = new MyPluginApi();
 *
 *     }
 *
 *     util.inherits(MyPlugin, openVeoApi.plugin.Plugin);
 *
 * @class PluginApi
 * @constructor
 */
function PluginApi() {
}

module.exports = PluginApi;
