'use strict';

var assert = require('chai').assert;
var Provider = process.requireApi('lib/providers/Provider.js');
var Storage = process.requireApi('lib/storages/Storage.js');

describe('Provider', function() {
  var provider;

  // Initializes tests
  beforeEach(function() {
    provider = new Provider(new Storage({}));
  });

  describe('properties', function() {

    it('should not be editable', function() {
      var properties = ['storage'];
      var provider = new Provider(new Storage({}));

      properties.forEach(function(property) {
        assert.throws(function() {
          provider[property] = null;
        }, null, null, 'Expected property "' + property + '" to be unalterable');
      });

    });

  });

  describe('constructor', function() {

    it('should throw a TypeError if storage is not an instance of Storage', function() {
      var wrongValues = [true, 42, {}, [], function() {}, 'string'];

      wrongValues.forEach(function(wrongValue) {
        assert.throws(function() {
          new Provider(wrongValue);
        });
      });
    });

  });

  describe('executeCallback', function() {

    it('should execute the given callback with arguments', function(done) {
      var expectedParameter1 = 'value 1';
      var expectedParameter2 = 'value 2';

      provider.executeCallback(function(param1, param2) {
        assert.equal(param1, expectedParameter1, 'Wrong parameter 1');
        assert.equal(param2, expectedParameter2, 'Wrong parameter 2');
        done();
      }, expectedParameter1, expectedParameter2);
    });

  });

});
