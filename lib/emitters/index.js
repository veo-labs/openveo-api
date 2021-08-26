'use strict';

/**
 * Defines an enhanced version of the Node.js EventEmitter.
 *
 * @example
 * // Load module "emitters"
 * var emitters = require('@openveo/api').emitters;
 *
 * @module emitters
 * @property {module:emitters/AdvancedEmitter} AdvancedEmitter AdvancedEmitter module
 * @property {module:emitters/AdvancedEvent} AdvancedEvent AdvancedEvent module
 */

module.exports.AdvancedEmitter = process.requireApi('lib/emitters/AdvancedEmitter.js');
module.exports.AdvancedEvent = process.requireApi('lib/emitters/AdvancedEvent.js');
