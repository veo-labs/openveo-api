'use strict';

var assert = require('chai').assert;
var Storage = process.requireApi('lib/storages/Storage.js');

describe('Storage', function() {

  describe('constructor', function() {

    it('should throw a TypeError if configuration is not an Object', function() {
      var wrongValues = [true, 42, 'String', [], function() {}];

      wrongValues.forEach(function(wrongValue) {
        assert.throws(function() {
          new Storage(wrongValue);
        });
      });
    });

  });

  describe('properties', function() {

    it('should not be editable', function() {
      var properties = ['configuration'];
      var storage = new Storage({});

      properties.forEach(function(property) {
        assert.throws(function() {
          storage[property] = null;
        }, null, null, 'Expected property "' + property + '" to be unalterable');
      });

    });

  });

});
