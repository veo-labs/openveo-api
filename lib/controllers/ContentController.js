'use strict';

/**
 * @module controllers
 */

var util = require('util');
var EntityController = process.requireAPI('lib/controllers/EntityController.js');

/**
 * Provides route actions for all requests relative to content entities.
 *
 * @class ContentController
 * @constructor
 * @extends EntityController
 * @param {Function} Entity An entity function extending EntityModel
 */
function ContentController(Entity) {
  EntityController.call(this, Entity);
}

module.exports = ContentController;
util.inherits(ContentController, EntityController);
