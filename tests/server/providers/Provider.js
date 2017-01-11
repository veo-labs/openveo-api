'use strict';

var assert = require('chai').assert;
var Provider = process.requireApi('lib/providers/Provider.js');
var Database = process.requireApi('lib/database/Database.js');

// Provider.js
describe('Provider', function() {

  // Constructor function
  describe('constructor', function() {

    it('should throw a TypeError if database is not a Database', function() {
      assert.throws(function() {
        new Provider({}, 'collection');
      });
    });

    it('should throw a TypeError if collection is not specified', function() {
      assert.throws(function() {
        new Provider(new Database({}));
      });
    });

  });

  // properties
  describe('properties', function() {

    it('should not be editable', function() {
      var provider = new Provider(new Database({}), 'collection');
      var properties = ['database', 'collection'];

      properties.forEach(function(property) {
        assert.throws(function() {
          provider[property] = null;
        }, null, null, 'Expected property "' + property + '" to be unalterable');
      });

    });

  });

});
