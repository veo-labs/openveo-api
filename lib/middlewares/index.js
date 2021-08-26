'use strict';

/**
 * OpenVeo ExpressJS middlewares.
 *
 * @example
 * // Load module "middlewares"
 * var middlewares = require('@openveo/api').middlewares;
 *
 * @module middlewares
 * @property {module:middlewares/disableCacheMiddleware} disableCacheMiddleware disableCacheMiddleware module
 * @property {module:middlewares/logRequestMiddleware} logRequestMiddleware logRequestMiddleware module
 * @property {module:middlewares/imageProcessorMiddleware} imageProcessorMiddleware imageProcessorMiddleware module
 */

module.exports.disableCacheMiddleware = process.requireApi('lib/middlewares/disableCacheMiddleware.js');
module.exports.logRequestMiddleware = process.requireApi('lib/middlewares/logRequestMiddleware.js');
module.exports.imageProcessorMiddleware = process.requireApi('lib/middlewares/imageProcessorMiddleware.js');
