'use strict';

/**
 * All OpenVeo Grunt tasks (http://gruntjs.com/).
 *
 * @example
 * // Load module "grunt"
 * var tasks = require('@openveo/api').grunt;
 *
 * @module grunt
 * @property {module:grunt/renameTask} renameTask renameTask module
 * @property {module:grunt/removeTask} removeTask removeTask module
 * @property {module:grunt/copyTask} copyTask copyTask module
 * @property {module:grunt/ngDpTask} ngDpTask ngDpTask module
 */

module.exports.renameTask = process.requireApi('lib/grunt/renameTask.js');
module.exports.removeTask = process.requireApi('lib/grunt/removeTask.js');
module.exports.copyTask = process.requireApi('lib/grunt/copyTask.js');
module.exports.ngDpTask = process.requireApi('lib/grunt/ngDpTask/ngDpTask.js');
