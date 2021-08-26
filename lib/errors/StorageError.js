'use strict';

/**
 * @module errors/StorageError
 */

var util = require('util');

/**
 * Defines a StorageError to be thrown when a storage error occurred.
 *
 * @example
 * var openVeoApi = require('@openveo/api');
 * throw new openVeoApi.errors.StorageError(42);
 *
 * @class StorageError
 * @extends Error
 * @constructor
 * @param {String} message The error message
 * @param {Number} code The code corresponding to the error
 */
function StorageError(message, code) {
  Error.captureStackTrace(this, this.constructor);

  Object.defineProperties(this,

    /** @lends module:errors/StorageError~StorageError */
    {

      /**
       * The error code.
       *
       * @type {Number}
       * @readonly
       * @instance
       */
      code: {value: code},

      /**
       * Error message.
       *
       * @type {String}
       * @instance
       */
      message: {value: 'A storage error occurred with code "' + code + '"', writable: true},

      /**
       * The error name.
       *
       * @type {String}
       * @instance
       */
      name: {value: 'StorageError', writable: true}

    }

  );

  if (message) this.message = message;
}

module.exports = StorageError;
util.inherits(StorageError, Error);
