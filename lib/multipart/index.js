'use strict';

/**
 * All elements necessary to parse multipart requests.
 *
 * @example
 * // Load module "multipart"
 * var multipart = require('@openveo/api').multipart;
 *
 * @module multipart
 * @property {module:multipart/MultipartParser} MultipartParser MultipartParser module
 */

module.exports.MultipartParser = process.requireApi('lib/multipart/MultipartParser.js');
