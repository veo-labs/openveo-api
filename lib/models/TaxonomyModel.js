'use strict';

/**
 * @module models
 */

var util = require('util');
var EntityModel = process.requireAPI('lib/models/EntityModel.js');
var TaxonomyProvider = process.requireAPI('lib/providers/TaxonomyProvider.js');
var applicationStorage = process.requireAPI('lib/applicationStorage.js');

/**
 * Defines a TaxonomyModel class to manipulate taxonomies.
 *
 * @example
 *
 *     // Example for implementing a new TaxonomyModel named "CustomModel"
 *
 *     // CustomModel.js
 *
 *     var util = require('util');
 *     var api = require('@openveo/api');
 *     var CustomProvider = process.require('CustomProvider.js');
 *
 *     function CustomModel() {
 *
 *       // Initialize the taxonomy model with a dedicated provider
 *       api.TaxonomyModel.call(this, new CustomProvider(api.applicationStorage.getDatabase()));
 *
 *     }
 *
 *     // CustomModel must extends TaxonomyModel
 *     module.exports = CustomModel;
 *     util.inherits(CustomModel, api.TaxonomyModel);
 *
 * @example
 *
 *     // Example for how to use CustomModel defined in previous example
 *
 *     var api = require('@openveo/api');
 *
 *     var CustomModel = process.require('CustomModel.js');
 *     var model = new CustomModel();
 *
 * @class TaxonomyModel
 * @constructor
 * @extends EntityModel
 */
function TaxonomyModel() {
  EntityModel.call(this, new TaxonomyProvider(applicationStorage.getDatabase()));
}

module.exports = TaxonomyModel;
util.inherits(TaxonomyModel, EntityModel);

/**
 * Gets taxonomies by name.
 *
 * @method getByName
 * @async
 * @param {String} name The name to look for
 * @param {Function} [callback] The function to call when it's done
 *   - **Error** The error if an error occurred, null otherwise
 *   - **Array** The list of taxonomies with the given name
 */
TaxonomyModel.prototype.getByName = function(name, callback) {
  this.provider.get({
    name: name
  },
  function(error, taxonomies) {
    if (callback)
      callback(error, taxonomies);
  });
};
