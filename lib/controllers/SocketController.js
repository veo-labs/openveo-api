'use strict';

/**
 * @module controllers
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
 *     // Implement a SocketController : "CustomSocketController"
 *     var util = require('util');
 *     var openVeoApi = require('@openveo/api');
 *
 *     function CustomSocketController(namespace) {
 *       CustomSocketController.super_.call(this, namespace);
 *     }
 *
 *     util.inherits(CustomSocketController, openVeoApi.controllers.SocketController);
 *
 * @class SocketController
 * @extends Controller
 * @constructor
 * @param {SocketNamespace} namespace The socket namespace associated to the controller
 */
function SocketController(namespace) {
  SocketController.super_.call(this);

  Object.defineProperties(this, {

    /**
     * Socket's namespace associated to the controller.
     *
     * @property namespace
     * @type SocketNamespace
     * @final
     */
    namespace: {value: namespace},

    /**
     * An emitter to emits clients' messages.
     *
     * @property emitter
     * @type AdvancedEmitter
     * @final
     */
    emitter: {value: new AdvancedEmitter()}

  });
}

module.exports = SocketController;
util.inherits(SocketController, Controller);

/**
 * Handles a client's socket's connection.
 *
 * Socket has been established with a client.
 *
 * @method connectAction
 * @param {Socket} socket The socket
 */
SocketController.prototype.connectAction = function(socket) {};

/**
 * Handles a client's socket's disconnection.
 *
 * Socket connection with a client has been lost.
 *
 * @method disconnectAction
 * @param {Socket} socket The socket
 */
SocketController.prototype.disconnectAction = function(socket) {};

/**
 * Handles a client's socket's connection errors.
 *
 * An error occurred on socket's communication.
 *
 * @method errorAction
 * @param {Error} error The error
 * @param {Socket} socket The socket
 */
SocketController.prototype.errorAction = function(error, socket) {};
