'use strict';

var assert = require('chai').assert;
var factory = process.requireApi('lib/storages/factory.js');
var MongoDatabase = process.requireApi('lib/storages/databases/mongodb/MongoDatabase.js');

describe('Storage factory', function() {

  describe('get', function() {

    it('should be able to instanciate a MongoDatabase', function() {
      var database = factory.get('mongodb', {});
      assert.ok(database instanceof MongoDatabase);
    });

    it('should throw a TypeError if unknown storage type', function() {
      assert.throws(function() {
        factory.get('wrongType');
      });
    });

  });

});
