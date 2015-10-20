'use strict';

/**
 * Defines a Plugin.
 *
 * @module plugin
 */

/**
 * Each plugin which wants to be loaded by core must inherit from this class.
 *
 * This Class must not be used directly, instead create a sub class.
 *
 * @example
 *
 *     // Example for implementing a new Plugin named "MyPlugin"
 *
 *     // MyPlugin.js
 *
 *     var openVeoAPI = require('@openveo/api');
 *     function MyPlugin(){
 *
 *       // Creates admin and front new routers
 *       this.router = express.Router();
 *       this.adminRouter = express.Router();
 *       this.webServiceRouter = express.Router();
 *
 *       // Define routes directly here or in the configuration file
 *
 *     }
 *
 *     MyPlugin.prototype.start = function() {
 *       console.log('My plugin loaded');
 *     };
 *
 *     module.exports = MyPlugin;
 *     util.inherits(MyPlugin, openVeoAPI.Plugin);
 *
 *
 * @class Plugin
 * @constructor
 */
function Plugin() {
}

module.exports = Plugin;

/**
 * The plugin public express router (all routes mounted on this router will be public).
 *
 * @property router
 * @default null
 * @type Router
 */
Plugin.prototype.router = null;

/**
 * The plugin back end express router (all routes mounted on this router will require user authentication).
 *
 * @property adminRouter
 * @default null
 * @type Router
 */
Plugin.prototype.adminRouter = null;

/**
 * The plugin web service express router (all routes mounted on this router will require a web
 * service authentication).
 *
 * @property webServiceRouter
 * @default null
 * @type Router
 */
Plugin.prototype.webServiceRouter = null;

/**
 * Indicates that the plugin is fully loaded.
 *
 * This won't be called by the Web Service.
 *
 * @method start
 */
Plugin.prototype.start = null;
