'use strict';

var assert = require('chai').assert;
var Database = process.requireApi('lib/database/Database.js');

// Database.js
describe('Database', function() {

  // properties
  describe('properties', function() {

    it('should not be editable', function() {
      var properties = ['type', 'host', 'port', 'name', 'username', 'password'];
      var conf = {};
      var database = new Database(conf);

      properties.forEach(function(property) {
        assert.throws(function() {
          database[property] = null;
        }, null, null, 'Expected property "' + property + '" to be unalterable');
      });

    });

  });

});
