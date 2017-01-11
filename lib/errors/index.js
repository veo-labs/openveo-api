'use strict';

/**
 * All OpenVeo specific errors.
 *
 *     // Load module "errors"
 *     var errors = require('@openveo/api').errors;
 *
 * @module errors
 * @main errors
 */

module.exports.AccessError = process.requireApi('lib/errors/AccessError.js');
module.exports.NotFoundError = process.requireApi('lib/errors/NotFoundError.js');
