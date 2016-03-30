'use strict';

/**
 * @module providers
 */

var util = require('util');
var EntityProvider = process.requireAPI('lib/providers/EntityProvider.js');

/**
 * Defines a TaxonomyProvider class to get and save taxonomies.
 *
 * @class TaxonomyProvider
 * @constructor
 * @extends EntityProvider
 * @param {Database} database The database to interact with
 */
function TaxonomyProvider(database) {
  EntityProvider.call(this, database, 'taxonomy');
}

module.exports = TaxonomyProvider;
util.inherits(TaxonomyProvider, EntityProvider);

/**
 * Creates taxonomies indexes.
 *
 * @method createIndexes
 * @async
 * @param {Function} callback Function to call when it's done with :
 *  - **Error** An error if something went wrong, null otherwise
 */
TaxonomyProvider.prototype.createIndexes = function(callback) {
  this.database.createIndexes(this.collection, [
    {key: {name: 1}, name: 'byName'}
  ], function(error, result) {
    if (result && result.note)
      process.logger.debug('Create taxonomies indexes : ' + result.note);

    callback(error);
  });
};
