'use strict';

/**
 * @module socket
 */

var events = require('events');
var util = require('util');

/**
 * Defines a base pilot for all pilots.
 *
 * A Pilot is designed to interact with sockets' clients. It listens to sockets' messages
 * by listening to its associated client emitter. It sends information to
 * sockets' clients using its associated socket namespace.
 *
 * A Pilot keeps a list of connected clients with associated sockets.
 *
 * @class Pilot
 * @constructor
 * @param {AdvancedEmitter} clientEmitter The clients' emitter
 * @param {SocketNamespace} namespace The clients' namespace
 */
function Pilot(clientEmitter, namespace) {
  Pilot.super_.call(this);

  Object.defineProperties(this, {

    /**
     * The list of actually connected clients.
     *
     * @property clients
     * @type Array
     * @final
     */
    clients: {value: []},

    /**
     * The emitter to receive sockets' messages from clients.
     *
     * @property clientEmitter
     * @type AdvancedEmitter
     * @final
     */
    clientEmitter: {value: clientEmitter},

    /**
     * The sockets' namespace to communicate with clients.
     *
     * @property namespace
     * @type SocketNamespace
     * @final
     */
    namespace: {value: namespace}

  });

}

module.exports = Pilot;
util.inherits(Pilot, events.EventEmitter);

/**
 * Gets a client by its associated socket id in the list of connected clients.
 *
 * @method getClientBySocketId
 * @param {String} socketId The socket id
 * @return {Object|Null} The client or null if not found
 */
Pilot.prototype.getClientBySocketId = function(socketId) {
  for (var i = 0; i < this.clients.length; i++) {
    if (this.clients[i].socket && this.clients[i].socket.id === socketId)
      return this.clients[i];
  }

  return null;
};

/**
 * Adds a client to the list of connected clients.
 *
 * @method addClient
 * @param {String} id The client's id
 * @param {Socket} socket The client's associated socket
 */
Pilot.prototype.addClient = function(id, socket) {
  if (id && socket) {
    this.clients.push({
      id: id,
      socket: socket
    });
  }
};

/**
 * Removes a client, by its associated socket id, from the list of connected clients.
 *
 * @method removeClientBySocketId
 * @param {String} id The socket id
 * @return {Object|Null} The removed client or null if not found
 */
Pilot.prototype.removeClientBySocketId = function(socketId) {
  var index = -1;

  for (var i = 0; i < this.clients.length; i++) {
    if (this.clients[i].socket && this.clients[i].socket.id === socketId)
      index = i;
  }

  if (index > -1) {
    var removedClient = this.clients[index];
    this.clients.splice(index, 1);
    return removedClient;
  }

  return null;
};

/**
 * Gets a connected client by its id.
 *
 * @method getClient
 * @param {String} id The client id
 * @return {Object|Null} The client or null if not found
 */
Pilot.prototype.getClient = function(id) {
  for (var i = 0; i < this.clients.length; i++) {
    if (this.clients[i].id === id)
      return this.clients[i];
  }

  return null;
};

/**
 * Emits a message.
 *
 * Alias of **events.EventEmitter.emit** method.
 *
 * @example
 *
 *     this.emitMessageAsIs('message', 'value1', 'value2');
 *
 *     // is equivalent to :
 *     this.emit('message', 'value1', 'value2');
 *
 * @method emitMessageAsIs
 * @param {String} name The event's name
 * @param {mixed} [...args] Any number of arguments
 */
Pilot.prototype.emitMessageAsIs = function() {
  this.emit.apply(this, arguments);
};

/**
 * Emits a message replacing socket by the associated client's id.
 *
 * @example
 *
 *     this.emitMessageWithId('message', 'value1', socket, callback);
 *
 *     // is equivalent to :
 *     this.emit('message', 'value1', socket.id, callback);
 *
 * @method emitMessageWithId
 * @param {mixed} [...args] Any number of arguments
 * @param {Socket} socket The socket
 * @param {Function} callback The function to call to respond to the client
 */
Pilot.prototype.emitMessageWithId = function() {
  var socket = arguments[arguments.length - 2];
  var client = this.getClientBySocketId(socket.id);

  if (client) {
    arguments[arguments.length - 2] = client.id;
    this.emit.apply(this, arguments);
  }
};
