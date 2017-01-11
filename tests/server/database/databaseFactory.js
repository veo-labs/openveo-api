'use strict';

var assert = require('chai').assert;
var factory = process.requireApi('lib/database/factory.js');
var MongoDatabase = process.requireApi('lib/database/mongodb/MongoDatabase.js');

// factory.js
describe('Database factory', function() {

  // get method
  describe('get', function() {

    it('should be able to instanciate a MongoDatabase', function() {
      var database = factory.get({
        type: 'mongodb'
      });
      assert.ok(database instanceof MongoDatabase);
    });

    it('should throw a TypeError if unknown database type', function() {
      assert.throws(function() {
        factory.get({
          type: 'wrontType'
        });
      });
    });

    it('should throw a TypeError if no database configuration', function() {
      assert.throws(function() {
        factory.get();
      });
    });

  });

});
