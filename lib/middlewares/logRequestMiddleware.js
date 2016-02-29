'use strict';

/**
 * @module middlewares
 */

/**
 * Defines an express middleware to log request information (header, method, path).
 *
 * @method logRequestMiddleware
 * @class logRequestMiddleware
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
