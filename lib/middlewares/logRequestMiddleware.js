'use strict';

/**
 * @module middlewares/logRequestMiddleware
 */

/**
 * Defines an expressJS middleware to log request's information (header, method, path).
 *
 * @example
 * var openVeoApi = require('@openveo/api');
 * expressApp.use(openVeoApi.middlewares.logRequestMiddleware);
 *
 * @method
 * @static
 * @param {Object} request The Express.JS Request object
 * @param {Object} response The Express.JS Response object
 * @param {Object} next The Express.JS next function
 */
module.exports = function logRequestMiddleware(request, response, next) {
  if (process.logger) {
    process.logger.info({
      method: request.method,
      path: request.url,
      headers: request.headers
    });
  }
  next();
};
