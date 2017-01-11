'use strict';

/**
 * @module models
 */

/**
 * Base model for all models.
 *
 *     // Implement a Model : "CustomModel"
 *     var util = require('util');
 *     var openVeoApi = require('@openveo/api');
 *
 *     function CustomModel(provider) {
 *       CustomModel.super_.call(this, provider);
 *     }
 *
 *     util.inherits(CustomModel, openVeoApi.models.Model);
 *
 * @class Model
 * @constructor
 */
function Model() {}

module.exports = Model;
