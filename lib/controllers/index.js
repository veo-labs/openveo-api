'use strict';

/**
 * Controllers execute actions on routed messages.
 *
 * A controller performs controls on incoming parameters, executes the requested action and send a response to the
 * client.
 *
 * @example
 * // Load module "controllers"
 * var controllers = require('@openveo/api').controllers;
 *
 * @module controllers
 * @property {module:controllers/Controller} Controller Controller module
 * @property {module:controllers/HttpController} HttpController HttpController module
 * @property {module:controllers/EntityController} EntityController EntityController module
 * @property {module:controllers/ContentController} ContentController ContentController module
 * @property {module:controllers/SocketController} SocketController SocketController module
 * @property {module:controllers/httpErrors} httpErrors httpErrors module
 */

module.exports.Controller = process.requireApi('lib/controllers/Controller.js');
module.exports.HttpController = process.requireApi('lib/controllers/HttpController.js');
module.exports.EntityController = process.requireApi('lib/controllers/EntityController.js');
module.exports.ContentController = process.requireApi('lib/controllers/ContentController.js');
module.exports.SocketController = process.requireApi('lib/controllers/SocketController.js');
module.exports.httpErrors = process.requireApi('lib/controllers/httpErrors.js');
