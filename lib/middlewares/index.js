'use strict';

/**
 * OpenVeo ExpressJS middlewares.
 *
 *     // Load module "middlewares"
 *     var middlewares = require('@openveo/api').middlewares;
 *
 * @module middlewares
 * @main middlewares
 */

module.exports.disableCacheMiddleware = process.requireApi('lib/middlewares/disableCacheMiddleware.js');
module.exports.logRequestMiddleware = process.requireApi('lib/middlewares/logRequestMiddleware.js');
