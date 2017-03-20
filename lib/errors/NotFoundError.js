'use strict';

/**
 * @module errors
 */

var util = require('util');

/**
 * Defines a NotFoundError to be thrown when a resource is not found.
 *
 *     var openVeoApi = require('@openveo/api');
 *     throw new openVeoApi.errors.NotFoundError(42);
 *
 * @class NotFoundError
 * @extends Error
 * @constructor
 * @param {String|Number} id The resource id which hasn't been found
 */
function NotFoundError(id) {
  Error.captureStackTrace(this, this.constructor);

  Object.defineProperties(this, {

    /**
     * The resource id which hasn't been found.
     *
     * @property id
     * @type Mixed
     * @final
     */
    id: {value: id},

    /**
     * Error message.
     *
     * @property message
     * @type String
     * @final
     */
    message: {value: 'Could not found resource "' + id + '"', writable: true},

    /**
     * The error name.
     *
     * @property name
     * @type String
     * @final
     */
    name: {value: 'NotFoundError', writable: true}

  });

}

module.exports = NotFoundError;
util.inherits(NotFoundError, Error);
