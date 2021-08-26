'use strict';

/**
 * @module controllers/SocketController
 */

var util = require('util');
var Controller = process.requireApi('lib/controllers/Controller.js');
var AdvancedEmitter = process.requireApi('lib/emitters/AdvancedEmitter.js');

/**
 * Defines base controller for all controllers which need to handle socket messages.
 *
 * A SocketController is associated to a namespace to be able to emit a message to the
 * whole socket namespace.
 *
 * A SocketController is also associated to an emitter to emit socket's clients' messages to pilots.
 *
 * @example
 * // Implement a SocketController : "CustomSocketController"
 * var util = require('util');
 * var openVeoApi = require('@openveo/api');
 *
 * function CustomSocketController(namespace) {
 *   CustomSocketController.super_.call(this, namespace);
 * }
 *
 * util.inherits(CustomSocketController, openVeoApi.controllers.SocketController);
 *
 * @class SocketController
 * @extends module:controllers/Controller~Controller
 * @constructor
 * @param {module:socket/SocketNamespace~SocketNamespace} namespace The socket namespace associated to the controller
 */
function SocketController(namespace) {
  SocketController.super_.call(this);

  Object.defineProperties(this,

    /** @lends module:controllers/SocketController~SocketController */
    {

      /**
       * Socket's namespace associated to the controller.
       *
       * @type module:socket/SocketNamespace~SocketNamespace
       * @instance
       * @readonly
       */
      namespace: {value: namespace},

      /**
       * An emitter to emits clients' messages.
       *
       * @type module:emitters/AdvancedEmitter~AdvancedEmitter
       * @instance
       * @readonly
       */
      emitter: {value: new AdvancedEmitter()}

    }

  );
}

module.exports = SocketController;
util.inherits(SocketController, Controller);

/**
 * Handles a client's socket's connection.
 *
 * Socket has been established with a client.
 *
 * @param {Object} socket The socket (see {@link https://socket.io/docs/v4/server-socket-instance})
 */
SocketController.prototype.connectAction = function(socket) {};

/**
 * Handles a client's socket's disconnection.
 *
 * Socket connection with a client has been lost.
 *
 * @param {Object} socket The socket (see {@link https://socket.io/docs/v4/server-socket-instance})
 */
SocketController.prototype.disconnectAction = function(socket) {};

/**
 * Handles a client's socket's connection errors.
 *
 * An error occurred on socket's communication.
 *
 * @param {Object} socket The socket (see {@link https://socket.io/docs/v4/server-socket-instance})
 */
SocketController.prototype.errorAction = function(error, socket) {};
