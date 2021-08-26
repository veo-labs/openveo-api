'use strict';

/**
 * Providers store resources they define.
 *
 * A provider is the protector of the resources it defines. It communicates with its associated storage to manipulate
 * its resources.
 *
 * @example
 * // Load module "providers"
 * var providers = require('@openveo/api').providers;
 *
 * @module providers
 * @property {module:providers/EntityProvider} EntityProvider EntityProvider module
 * @property {module:providers/Provider} Provider Provider module
 */

module.exports.EntityProvider = process.requireApi('lib/providers/EntityProvider.js');
module.exports.Provider = process.requireApi('lib/providers/Provider.js');
