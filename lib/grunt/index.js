'use strict';

/**
 * All OpenVeo Grunt tasks (http://gruntjs.com/).
 *
 *     // Load module "grunt"
 *     var tasks = require('@openveo/api').grunt;
 *
 * @module grunt
 * @main grunt
 */

module.exports.renameTask = process.requireApi('lib/grunt/renameTask.js');
module.exports.removeTask = process.requireApi('lib/grunt/removeTask.js');
module.exports.ngDpTask = process.requireApi('lib/grunt/ngDpTask/ngDpTask.js');
