'use strict';

/**
 * @module middlewares
 */

/**
 * Defines an expressJS middleware to log request's information (header, method, path).
 *
 *     var openVeoApi = require('@openveo/api');
 *     expressApp.use(openVeoApi.middlewares.logRequestMiddleware);
 *
 * @class logRequestMiddleware
 * @static
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
