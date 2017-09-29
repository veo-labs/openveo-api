'use strict';

/**
 * Passport strategies.
 *
 *     // Load module "passport"
 *     var plugin = require('@openveo/api').passport;
 *
 * @module passport
 * @main passport
 */

module.exports.strategyFactory = process.requireApi('lib/passport/strategies/strategyFactory.js');
module.exports.STRATEGIES = process.requireApi('lib/passport/strategies/strategies.js');
