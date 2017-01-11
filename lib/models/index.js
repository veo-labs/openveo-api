'use strict';

/**
 * Base models to be used by all models.
 *
 *     // Load module "models"
 *     var models = require('@openveo/api').models;
 *
 * @module models
 * @main models
 */

module.exports.ContentModel = process.requireApi('lib/models/ContentModel.js');
module.exports.EntityModel = process.requireApi('lib/models/EntityModel.js');
module.exports.Model = process.requireApi('lib/models/Model.js');
