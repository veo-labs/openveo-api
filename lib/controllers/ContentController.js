'use strict';

/**
 * @module controllers
 */

var util = require('util');
var EntityController = process.requireApi('lib/controllers/EntityController.js');

/**
 * Defines base controller for all controllers which need to provide HTTP route actions for all requests
 * relative to content entities.
 *
 *     // Implement a ContentController : "CustomContentController"
 *     var util = require('util');
 *     var openVeoApi = require('@openveo/api');
 *
 *     function CustomContentController() {
 *       CustomContentController.super_.call(this);
 *     }
 *
 *     util.inherits(CustomContentController, openVeoApi.controllers.ContentController);
 *
 * @class ContentController
 * @extends EntityController
 * @constructor
 * @throws {TypeError} An error if constructors are not as expected
 */
function ContentController() {
  ContentController.super_.call(this);
}

module.exports = ContentController;
util.inherits(ContentController, EntityController);
