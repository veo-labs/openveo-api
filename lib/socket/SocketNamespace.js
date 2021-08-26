'use strict';

/**
 * @module socket/SocketNamespace
 */

/**
 * Mounts the namespace's handlers on socket.io namespace.
 *
 * @method mountHandlers
 * @private
 * @this module:socket/SocketNamespace~SocketNamespace
 * @memberof module:socket/SocketNamespace~SocketNamespace
 */
function mountHandlers() {
  var self = this;

  for (var id in this.handlers) {
    this.handlers[id].forEach(function(handler) {
      self.namespace.on(id, handler);
    });
  }
}

/**
 * Mounts the namespace's middlewares on socket.io namespace.
 *
 * @method mountMiddlewares
 * @private
 * @this module:socket/SocketNamespace~SocketNamespace
 * @memberof module:socket/SocketNamespace~SocketNamespace
 */
function mountMiddlewares() {
  var self = this;

  this.middlewares.forEach(function(middleware) {
    self.namespace.use(middleware);
  });
}

/**
 * Defines socket.io namespace wrapper.
 *
 * SocketNamespace wraps a socket.io namespace to be able to connect the namespace to the server after
 * adding handlers to it.
 * Creating a Namespace using socket.io can't be done without creating the server
 * and attaching the namespace to it.
 *
 * @example
 * var openVeoApi = require('@openveo/api');
 * var namespace = new openVeoApi.socket.SocketNamespace();
 * var server = new openVeoApi.socket.SocketServer();
 *
 * // Add a middleware
 * namespace.use(function(socket, next) {
 *   console.log('Called for every message');
 * });
 *
 * // Listen to a message
 * namespace.on('test.message', function(data) {
 *   console.log('test.message received');
 *   console.log(data);
 * });
 *
 * // Add namespace to server
 * server.addNamespace('/myName', namespace);
 *
 * // Start server
 * server.listen(80, function() {
 *   console.log('Socket server started');
 *   namespace.emit('test.message', 'some data');
 * });
 *
 * @class SocketNamespace
 * @constructor
 */
function SocketNamespace() {
  var self = this;
  var namespace = null;

  Object.defineProperties(this,

    /** @lends module:socket/SocketNamespace~SocketNamespace */
    {

      /**
       * The list of messages' handlers.
       *
       * @type {Object}
       * @instance
       * @readonly
       */
      handlers: {value: {}},

      /**
       * The list of middlewares.
       *
       * @type {Array}
       * @instance
       * @readonly
       */
      middlewares: {value: []},

      /**
       * The socket namespace.
       *
       * @type {Namespace}
       * @instance
       * @readonly
       */
      namespace: {
        get: function() {
          return namespace;
        },
        set: function(newNamespace) {
          namespace = newNamespace;

          mountHandlers.call(self);
          mountMiddlewares.call(self);
        }
      }
    }
  );
}

module.exports = SocketNamespace;

/**
 * Listens to a socket's message.
 *
 * @param {String} id The message id to listen to
 * @param {Function} handler Function to call when receiving the message
 */
SocketNamespace.prototype.on = function(id, handler) {
  if ((typeof id === 'string' || id instanceof String) && handler instanceof Function) {

    if (!this.handlers[id])
      this.handlers[id] = [];

    this.handlers[id].push(handler);

    if (this.namespace)
      this.namespace.on(id, handler);
  }
};

/**
 * Registers a middleware.
 *
 * Middleware gets executed for every incoming socket and receives as parameters the socket and
 * a function to optionally defer execution to the next registered middleware.
 *
 * @param {Function} middleware Function to call when receiving the message
 * @return {module:socket/SocketNamespace~SocketNamespace} The socket namespace
 */
SocketNamespace.prototype.use = function(middleware) {
  if (middleware instanceof Function) {
    this.middlewares.push(middleware);

    if (this.namespace)
      this.namespace.use(middleware);
  }

  return this;
};

/**
 * Emits a message to all clients connected to the namespace.
 *
 * It will work only if the socket server is started.
 *
 * @param {String} message The message to send to clients
 * @param {*} data The data to send to clients
 */
SocketNamespace.prototype.emit = function(message, data) {
  if (this.namespace)
    this.namespace.emit(message, data);
};
