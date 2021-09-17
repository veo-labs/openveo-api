'use strict';

/**
 * Holds a file system watcher.
 *
 * File system watcher is a Node.js wrapper for fs.watch to simplify its usage and add more consistency between
 * operating systems.
 *
 * @example
 * // Load module "watcher"
 * var watcher = require('@openveo/api').watcher;
 * console.log(watcher.Watcher);
 *
 * @module watcher
 * @property {module:watcher/Watcher} Watcher Watcher module
 * @property {module:watcher/WatcherError} WatcherError WatcherError module
 */

module.exports.Watcher = process.requireApi('lib/watcher/Watcher.js');
module.exports.WatcherError = process.requireApi('lib/watcher/WatcherError.js');
