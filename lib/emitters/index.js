'use strict';

/**
 * Defines an enhanced version of the Node.js EventEmitter.
 *
 *     // Load module "emitters"
 *     var emitters = require('@openveo/api').emitters;
 *
 * @module emitters
 * @main emitters
 */

module.exports.AdvancedEmitter = process.requireApi('lib/emitters/AdvancedEmitter.js');
module.exports.AdvancedEvent = process.requireApi('lib/emitters/AdvancedEvent.js');
