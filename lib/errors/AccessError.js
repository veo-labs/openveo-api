'use strict';

/**
 * @module errors/AccessError
 */

var util = require('util');

/**
 * Defines an AccessError to be thrown when a resource is forbidden.
 *
 * @example
 * var openVeoApi = require('@openveo/api');
 * throw new openVeoApi.errors.AccessError('You do not have permission to access this resource');
 *
 * @class AccessError
 * @extends Error
 * @constructor
 * @param {String} message The error message
 */
function AccessError(message) {
  Error.captureStackTrace(this, this.constructor);

  Object.defineProperties(this,

    /** @lends module:errors/AccessError~AccessError */
    {

      /**
       * Error message.
       *
       * @type {String}
       * @instance
       */
      message: {value: message, writable: true},

      /**
       * Error name.
       *
       * @type {String}
       * @instance
       */
      name: {value: 'AccessError', writable: true}

    }

  );
}

module.exports = AccessError;
util.inherits(AccessError, Error);
