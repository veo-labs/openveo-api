'use strict';

/**
 * @module middlewares/disableCacheMiddleware
 */

/**
 * Defines an express middleware to deactivate user agent cache of requests.
 *
 * - **Cache-Control** : *no-cache* to force caches to request the original server
 * - **Cache-Control** : *no-store* to force caches not to keep any copy of the response
 * - **Cache-Control** : *must-revalidate* to force caches to ask original server validation of a stale response
 * - **Pragma** : *no-cache* to be backward compatible with HTTP/1.0 caches
 * - **Expires** : *0* to mark all responses as staled
 *
 * @example
 * var openVeoApi = require('@openveo/api');
 * expressApp.use(openVeoApi.middlewares.disableCacheMiddleware);
 *
 * @method
 * @static
 * @param {Object} request The Express.JS Request object
 * @param {Object} response The Express.JS Response object
 * @param {Object} next The Express.JS next function
 */
module.exports = function disableCacheMiddleware(request, response, next) {
  response.set({
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    Pragma: 'no-cache',
    Expires: 0
  });
  next();
};
