'use strict';

/**
 * @module controllers/HttpController
 */

var util = require('util');
var Controller = process.requireApi('lib/controllers/Controller.js');

/**
 * Defines base controller for all controllers which need to provide HTTP route actions for HTTP requests.
 *
 * @class HttpController
 * @extends module:controllers/Controller~Controller
 * @constructor
 */
function HttpController() {
  HttpController.super_.call(this);
}

module.exports = HttpController;
util.inherits(HttpController, Controller);
