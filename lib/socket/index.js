'use strict';

/**
 * All elements necessary to create socket servers.
 *
 *     // Load module "socket"
 *     var socket = require('@openveo/api').socket;
 *
 * @module socket
 * @main socket
 */

module.exports.Pilot = process.requireApi('lib/socket/Pilot.js');
module.exports.SocketNamespace = process.requireApi('lib/socket/SocketNamespace.js');
module.exports.SocketServer = process.requireApi('lib/socket/SocketServer.js');
