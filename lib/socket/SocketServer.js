'use strict';

/**
 * @module socket/SocketServer
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
 * @example
 * var openVeoApi = require('@openveo/api');
 * var namespace1 = new openVeoApi.socket.SocketNamespace();
 * var namespace2 = new openVeoApi.socket.SocketNamespace();
 * var server = new openVeoApi.socket.SocketServer();
 *
 * // Listen to a message on first namespace
 * namespace1.on('namespace1.message', function() {
 *   console.log('namespace1.message received');
 * });
 *
 * // Listen to a message on second namespace
 * namespace2.on('namespace2.message', function() {
 *   console.log('namespace2.message received');
 * });
 *
 * // Add namespace1 to the server
 * server.addNamespace('/namespace1', namespace1);
 *
 * // Start server
 * server.listen(80, function() {
 *   console.log('Socket server started');
 *   namespace.emit('namespace1.message');
 *
 *   // Adding a namespace after the server is started will also work
 *   server.addNamespace('/namespace2', namespace2);
 *   namespace2.emit('namespace2.message');
 * });
 *
 * @class SocketServer
 * @constructor
 */
function SocketServer() {
  Object.defineProperties(this,

    /** @lends module:socket/SocketServer~SocketServer */
    {

      /**
       * The Socket.io server.
       *
       * @type {Object}
       * @instance
       */
      io: {value: null, writable: true},

      /**
       * The list of namespaces added to the server indexed by names.
       *
       * @type {Object}
       * @instance
       * @readonly
       */
      namespaces: {value: {}}

    }

  );

}

module.exports = SocketServer;

/**
 * Starts the Socket server and mount namespaces.
 *
 * @param {Number} port The port to use for the server
 * @param {Array} allowedOrigins The list of authorized origins
 * @return {Function} callback Function to call when its done
 */
SocketServer.prototype.listen = function(port, allowedOrigins, callback) {
  if (!this.io) {
    this.io = socket(
      port,
      {
        serveClient: false,
        maxHttpBufferSize: 5e6,
        cors: {
          origin: allowedOrigins,
          methods: ['GET', 'POST'],
          credentials: true
        },
        allowEIO3: true
      }
    );

    for (var name in this.namespaces)
      this.namespaces[name].namespace = this.io.of(name);

    callback();
  } else
    throw new Error('Socket server already started');
};

/**
 * Closes the server.
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
 * @param {String} name The namespace name
 * @param {module:socket/SocketNamespace~SocketNamespace} namespace The socket namespace to add
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
 * @param {String} name The namespace name
 * @return {module:socket/SocketNamespace~SocketNamespace} The namespace
 */
SocketServer.prototype.getNamespace = function(name) {
  return this.namespaces[name];
};
