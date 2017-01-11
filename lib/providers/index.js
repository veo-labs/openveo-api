'use strict';

/**
 * Base providers' to be used by all providers.
 *
 *     // Load module "providers"
 *     var providers = require('@openveo/api').providers;
 *
 * @module providers
 * @main providers
 */

module.exports.EntityProvider = process.requireApi('lib/providers/EntityProvider.js');
module.exports.Provider = process.requireApi('lib/providers/Provider.js');
