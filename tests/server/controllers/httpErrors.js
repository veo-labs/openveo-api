'use strict';

var assert = require('chai').assert;
var HTTP_ERRORS = process.requireApi('lib/controllers/httpErrors.js');

// httpErrors.js
describe('httpErrors', function() {

  it('should not be editable', function() {
    assert.throws(function() {
      HTTP_ERRORS.NEW_ERROR = 42;
    });
  });

});
