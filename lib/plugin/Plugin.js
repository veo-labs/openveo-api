'use strict';

/**
 * @module plugin
 */

/**
 * Defines a base class for all plugins.
 *
 *     // Implement a Plugin : "MyPlugin"
 *     var util = require('util');
 *     var express = require('express');
 *     var openVeoApi = require('@openveo/api');
 *     var MyPluginApi = require('./MyPluginApi.js');
 *
 *     function MyPlugin() {
 *       MyPlugin.super_.call(this);
 *
 *       // Creates public, private and Web Service HTTP routers
 *       this.router = express.Router();
 *       this.adminRouter = express.Router();
 *       this.webServiceRouter = express.Router();
 *
 *       // Exposes MyPlugin's APIs
 *       this.api = new MyPluginApi();
 *
 *     }
 *
 *     MyPlugin.prototype.init = function() {
 *       console.log('Initialize plugin');
 *     };
 *
 *     MyPlugin.prototype.start = function() {
 *       console.log('Start plugin');
 *     };
 *
 *     util.inherits(MyPlugin, openVeoApi.plugin.Plugin);
 *
 * @class Plugin
 * @constructor
 */
function Plugin() {
}

module.exports = Plugin;

/**
 * Offers the possibility to initialize the plugin.
 *
 * A plugin may want, for example, to use this method to create indexes for its collections.
 *
 * @method init
 * @async
 * @param {Function} callback Function to call when it's done with :
 *  - **Error** An error if something went wrong, null otherwise
 */
Plugin.prototype.init = null;

/**
 * Indicates that the plugin is fully loaded in application process and can be started.
 *
 * @method start
 * @async
 * @param {Function} callback Function to call when it's done with :
 *  - **Error** An error if something went wrong, null otherwise
 */
Plugin.prototype.start = null;
