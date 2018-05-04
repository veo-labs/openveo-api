'use strict';

/**
 * Providers store resources they define.
 *
 * A provider is the protector of the resources it defines. It communicates with its associated storage to manipulate
 * its resources.
 *
 *     // Load module "providers"
 *     var providers = require('@openveo/api').providers;
 *
 * @module providers
 * @main providers
 */

module.exports.EntityProvider = process.requireApi('lib/providers/EntityProvider.js');
module.exports.Provider = process.requireApi('lib/providers/Provider.js');
