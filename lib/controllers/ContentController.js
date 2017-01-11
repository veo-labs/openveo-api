'use strict';

/**
 * @module controllers
 */

var util = require('util');
var EntityController = process.requireApi('lib/controllers/EntityController.js');
var ContentModel = process.requireApi('lib/models/ContentModel.js');
var api = process.requireApi('lib/api.js');

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
 * @param {ContentModel} ModelConstructor The model constructor associated to the entity
 * @param {EntityProvider} ProviderConstructor The provider constructor associated to the entity
 * @throws {TypeError} An error if constructors are not as expected
 */
function ContentController(ModelConstructor, ProviderConstructor) {
  ContentController.super_.call(this, ModelConstructor, ProviderConstructor);

  if (!(ModelConstructor.prototype instanceof ContentModel))
    throw new TypeError('ContentController requires a ContentModel constructor');
}

module.exports = ContentController;
util.inherits(ContentController, EntityController);

/**
 * Gets an instance of the content model.
 *
 * Unlike EntityModel, a ContentModel must be associated to a user.
 *
 * @method getModel
 * @param {Object} request The HTTP request
 * @param {Object} request.user Information about the connected user
 * @param {String} request.user.id User's id
 * @param {Array} request.user.permissions User's list of permissions
 * @return {ContentModel} The content model
 */
ContentController.prototype.getModel = function(request) {
  return new this.Model(request.user, new this.Provider(api.getCoreApi().getDatabase()));
};
