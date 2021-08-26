'use strict';

/**
 * All OpenVeo specific errors.
 *
 * @example
 * // Load module "errors"
 * var errors = require('@openveo/api').errors;
 *
 * @module errors
 * @property {module:errors/AccessError} AccessError AccessError module
 * @property {module:errors/NotFoundError} NotFoundError NotFoundError module
 * @property {module:errors/StorageError} StorageError StorageError module
 */

module.exports.AccessError = process.requireApi('lib/errors/AccessError.js');
module.exports.NotFoundError = process.requireApi('lib/errors/NotFoundError.js');
module.exports.StorageError = process.requireApi('lib/errors/StorageError.js');
