'use strict';

/**
 * All elements necessary to create socket servers.
 *
 * @example
 * // Load module "socket"
 * var socket = require('@openveo/api').socket;
 *
 * @module socket
 * @property {module:socket/Pilot} Pilot Pilot module
 * @property {module:socket/SocketNamespace} SocketNamespace SocketNamespace module
 * @property {module:socket/SocketServer} SocketServer SocketServer module
 */

module.exports.Pilot = process.requireApi('lib/socket/Pilot.js');
module.exports.SocketNamespace = process.requireApi('lib/socket/SocketNamespace.js');
module.exports.SocketServer = process.requireApi('lib/socket/SocketServer.js');
