'use strict';

/**
 * @module errors
 */

var util = require('util');

/**
 * Defines an AccessError.
 *
 * Access errors are thrown when a user tried to manipulate a content without requested permissions.
 *
 * @class AccessError
 * @extends Error
 * @constructor
 * @param {String} message The error message
 */
function AccessError(message) {
  Error.call(this, message);
}

module.exports = AccessError;
util.inherits(AccessError, Error);
