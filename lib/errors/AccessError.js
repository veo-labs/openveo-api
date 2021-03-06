'use strict';

/**
 * @module errors
 */

var util = require('util');

/**
 * Defines an AccessError to be thrown when a resource is forbidden.
 *
 *     var openVeoApi = require('@openveo/api');
 *     throw new openVeoApi.errors.AccessError('You do not have permission to access this resource');
 *
 * @class AccessError
 * @extends Error
 * @constructor
 * @param {String} message The error message
 */
function AccessError(message) {
  Error.captureStackTrace(this, this.constructor);

  Object.defineProperties(this, {

    /**
     * Error message.
     *
     * @property message
     * @type String
     * @final
     */
    message: {value: message, writable: true},

    /**
     * Error name.
     *
     * @property name
     * @type String
     * @final
     */
    name: {value: 'AccessError', writable: true}

  });
}

module.exports = AccessError;
util.inherits(AccessError, Error);
