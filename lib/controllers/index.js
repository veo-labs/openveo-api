'use strict';

/**
 * Base controllers' stuff to be used by all controllers.
 *
 *     // Load module "controllers"
 *     var controllers = require('@openveo/api').controllers;
 *
 * @module controllers
 * @main controllers
 */

module.exports.Controller = process.requireApi('lib/controllers/Controller.js');
module.exports.EntityController = process.requireApi('lib/controllers/EntityController.js');
module.exports.ContentController = process.requireApi('lib/controllers/ContentController.js');
module.exports.SocketController = process.requireApi('lib/controllers/SocketController.js');
module.exports.httpErrors = process.requireApi('lib/controllers/httpErrors.js');
