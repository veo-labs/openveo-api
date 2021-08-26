'use strict';

/**
 * @module plugin/PluginApi
 */

var async = require('async');

/**
 * Defines a base plugin API for all plugins' which need to expose an API.
 *
 * @example
 * // Implement a PluginApi : "MyPluginApi"
 * // for a plugin named "my-plugin"
 *
 * var util = require('util');
 * var openVeoApi = require('@openveo/api');
 *
 * function MyPluginApi() {
 *   MyPluginApi.super_.call(this);
 * }
 *
 * util.inherits(MyPluginApi, openVeoApi.plugin.PluginApi);
 *
 * // Associate the API to the plugin when creating it
 * function MyPlugin() {
 *   MyPlugin.super_.call(this);
 *
 *   // Exposes MyPlugin's APIs
 *   this.api = new MyPluginApi();
 *
 * }
 *
 * util.inherits(MyPlugin, openVeoApi.plugin.Plugin);
 *
 * @class PluginApi
 * @constructor
 */
function PluginApi() {
  Object.defineProperties(this,

    /** @lends module:plugin/PluginApi~PluginApi */
    {

      /**
       * The list of registered actions.
       *
       * Property names are the action names and values are functions.
       *
       * @type {Object}
       * @instance
       * @readonly
       */
      actions: {value: {}}

    }

  );
}

module.exports = PluginApi;

/**
 * Registers an action to be executed when a hook occurs.
 *
 * @param {String} hook The hook to register action on
 * @param {Function} action The function to execute when hook is executed
 */
PluginApi.prototype.registerAction = function(hook, action) {
  if (!hook ||
      !action ||
      Object.prototype.toString.call(action) !== '[object Function]' ||
      Object.prototype.toString.call(hook) !== '[object String]')
    throw new Error('registerAction need and hook and an action');

  if (!this.actions[hook]) this.actions[hook] = [];
  this.actions[hook].push(action);
};

/**
 * Unregisters an action registered on a hook.
 *
 * @param {String} hook The hook to unregister action from
 * @param {Function} action The function action
 */
PluginApi.prototype.unregisterAction = function(hook, action) {
  if (this.actions[hook]) {
    var index = this.actions[hook].indexOf(action);

    if (index >= 0)
      this.actions[hook].splice(index, 1);
  }
};

/**
 * Executes all actions registered for a hook.
 *
 * All actions are executed in the registration order.
 *
 * @param {String} hook The hook associated to actions
 * @param {*} data The data to transmit to the actions
 * @param {callback} callback The function to call when it's done
 */
PluginApi.prototype.executeHook = function(hook, data, callback) {
  if (!hook ||
      Object.prototype.toString.call(hook) !== '[object String]' ||
      !this.actions[hook]) {
    return callback();
  }

  var asyncActions = [];

  this.actions[hook].forEach(function(action) {
    asyncActions.push(function(callback) {
      action(data, callback);
    });
  });

  async.series(asyncActions, function(error, results) {
    callback(error);
  });
};

/**
 * Gets available hooks of the plugin.
 *
 * This should be overrided by plugins.
 *
 * @return {Object} The list of hooks
 */
PluginApi.prototype.getHooks = function() {
  return {};
};
