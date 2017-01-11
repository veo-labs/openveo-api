'use strict';

var assert = require('chai').assert;
var MongoDatabase = process.requireApi('lib/database/mongodb/MongoDatabase.js');

// MongoDatabase.js
describe('MongoDatabase', function() {

  // properties
  describe('properties', function() {

    it('should not be editable', function() {
      var properties = ['seedlist', 'replicaSet'];
      var database = new MongoDatabase({});

      properties.forEach(function(property) {
        assert.throws(function() {
          database[property] = null;
        }, null, null, 'Expected property "' + property + '" to be unalterable');
      });

    });

  });

});
