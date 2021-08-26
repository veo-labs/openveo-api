'use strict';

/**
 * Passport strategies.
 *
 * @example
 * // Load module "passport"
 * var plugin = require('@openveo/api').passport;
 *
 * @module passport
 * @property {module:passport/strategyFactory} strategyFactory strategyFactory module
 * @property {module:passport/STRATEGIES} STRATEGIES STRATEGIES module
 */

module.exports.strategyFactory = process.requireApi('lib/passport/strategies/strategyFactory.js');
module.exports.STRATEGIES = process.requireApi('lib/passport/strategies/strategies.js');
