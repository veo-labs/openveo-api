'use strict';

/**
 * @module errors/NotFoundError
 */

var util = require('util');

/**
 * Defines a NotFoundError to be thrown when a resource is not found.
 *
 * @example
 * var openVeoApi = require('@openveo/api');
 * throw new openVeoApi.errors.NotFoundError(42);
 *
 * @class NotFoundError
 * @extends Error
 * @constructor
 * @param {(String|Number)} id The resource id which hasn't been found
 */
function NotFoundError(id) {
  Error.captureStackTrace(this, this.constructor);

  Object.defineProperties(this,

    /** @lends module:errors/NotFoundError~NotFoundError */
    {

      /**
       * The resource id which hasn't been found.
       *
       * @type {(String|Number)}
       * @instance
       * @readonly
       */
      id: {value: id},

      /**
       * Error message.
       *
       * @type {String}
       * @instance
       */
      message: {value: 'Could not found resource "' + id + '"', writable: true},

      /**
       * The error name.
       *
       * @type {String}
       * @instance
       */
      name: {value: 'NotFoundError', writable: true}

    }

  );

}

module.exports = NotFoundError;
util.inherits(NotFoundError, Error);
