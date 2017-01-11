'use strict';

/**
 * @module controllers
 */

/**
 * Defines base controller for all controllers.
 *
 *     // Implement a Controller : "CustomController"
 *     var util = require('util');
 *     var openVeoApi = require('@openveo/api');
 *
 *     function CustomController() {
 *       CustomController.super_.call(this);
 *     }
 *
 *     util.inherits(CustomController, openVeoApi.controllers.Controller);
 *
 * @class Controller
 * @constructor
 */
function Controller() {}

module.exports = Controller;
