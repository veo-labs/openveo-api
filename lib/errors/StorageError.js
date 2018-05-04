'use strict';

/**
 * @module errors
 */

var util = require('util');

/**
 * Defines a StorageError to be thrown when a storage error occurred.
 *
 *     var openVeoApi = require('@openveo/api');
 *     throw new openVeoApi.errors.StorageError(42);
 *
 * @class StorageError
 * @extends Error
 * @constructor
 * @param {String} message The error message
 * @param {Number} code The code corresponding to the error
 */
function StorageError(message, code) {
  Error.captureStackTrace(this, this.constructor);

  Object.defineProperties(this, {

    /**
     * The error code.
     *
     * @property code
     * @type Number
     * @final
     */
    code: {value: code},

    /**
     * Error message.
     *
     * @property message
     * @type String
     * @final
     */
    message: {value: 'A storage error occurred with code "' + code + '"', writable: true},

    /**
     * The error name.
     *
     * @property name
     * @type String
     * @final
     */
    name: {value: 'StorageError', writable: true}

  });

  if (message) this.message = message;
}

module.exports = StorageError;
util.inherits(StorageError, Error);
