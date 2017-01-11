'use strict';

/**
 * @module socket
 */

var socket = require('socket.io');
var SocketNamespace = process.requireApi('lib/socket/SocketNamespace.js');

/**
 * Defines a SocketServer around a socket.io server.
 *
 * Creating a server using socket.io can't be done without launching the server
 * and start listening to messages. SocketServer helps creating a socket server
 * and add namespaces to it without starting the server.
 *
 *     var openVeoApi = require('@openveo/api');
 *     var namespace1 = new openVeoApi.socket.SocketNamespace();
 *     var namespace2 = new openVeoApi.socket.SocketNamespace();
 *     var server = new openVeoApi.socket.SocketServer();
 *
 *     // Listen to a message on first namespace
 *     namespace1.on('namespace1.message', function() {
 *       console.log('namespace1.message received');
 *     });
 *
 *     // Listen to a message on second namespace
 *     namespace2.on('namespace2.message', function() {
 *       console.log('namespace2.message received');
 *     });
 *
 *     // Add namespace1 to the server
 *     server.addNamespace('/namespace1', namespace1);
 *
 *     // Start server
 *     server.listen(80, function() {
 *       console.log('Socket server started');
 *       namespace.emit('namespace1.message');
 *
 *       // Adding a namespace after the server is started will also work
 *       server.addNamespace('/namespace2', namespace2);
 *       namespace2.emit('namespace2.message');
 *     });
 *
 * @class SocketServer
 * @constructor
 */
function SocketServer() {

  Object.defineProperties(this, {

    /**
     * The Socket.io server.
     *
     * @property io
     * @type Server
     */
    io: {value: null, writable: true},

    /**
     * The list of namespaces added to the server indexed by names.
     *
     * @property namespaces
     * @type Object
     */
    namespaces: {value: {}}

  });

}

module.exports = SocketServer;

/**
 * Starts the Socket server and mount namespaces.
 *
 * @method listen
 * @async
 * @param {Number} port The port to use for the server
 * @return {Function} callback Function to call when its done
 */
SocketServer.prototype.listen = function(port, callback) {
  if (!this.io) {
    this.io = socket(port);

    for (var name in this.namespaces)
      this.namespaces[name].namespace = this.io.of(name);

    callback();
  } else
    throw new Error('Socket server already started');
};

/**
 * Closes the server.
 *
 * @method close
 */
SocketServer.prototype.close = function() {
  if (this.io) {
    this.io.close();
    this.io = null;
  }
};

/**
 * Adds a namespace to the server.
 *
 * @method addNamespace
 * @param {String} name The namespace name
 * @param {SocketNamespace} namespace The socket namespace to add
 */
SocketServer.prototype.addNamespace = function(name, namespace) {
  if ((namespace instanceof SocketNamespace) && name)
    this.namespaces[name] = namespace;

  if (this.io)
    namespace.namespace = this.io.of(name);
};

/**
 * Gets a namespace.
 *
 * @method getNamespace
 * @param {String} name The namespace name
 * @return {SocketNamespace} The namespace
 */
SocketServer.prototype.getNamespace = function(name) {
  return this.namespaces[name];
};
