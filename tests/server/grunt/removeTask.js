'use strict';

var fs = require('fs');
var path = require('path');
var assert = require('chai').assert;
var removeTask = process.requireApi('lib/grunt/removeTask.js');
var fileSystem = process.requireApi('lib/fileSystem.js');

// removeTask.js
describe('removeTask', function() {
  var tmpDir = path.join(__dirname, 'tmp');
  var src = path.join(tmpDir, 'source');
  var grunt;
  var renameFunction;

  // Mock
  beforeEach(function() {
    grunt = {
      fail: {
        fatal: function(error) {
          throw error;
        }
      },
      verbose: {
        writeln: function() {}
      },
      file: {
        isDir: function(sourcePath) {
          return !path.parse(sourcePath).ext;
        }
      },
      log: {
        oklns: function() {}
      }
    };
  });

  // Prepare tests
  beforeEach(function() {
    renameFunction = removeTask(grunt);
  });

  // Create tmp directory
  beforeEach(function(done) {
    fileSystem.mkdir(src, function(error) {
      done();
    });
  });

  // Remove tmp directory
  afterEach(function(done) {
    fileSystem.rmdir(tmpDir, function(error) {
      done();
    });
  });

  it('should be able to remove a resource', function(done) {
    function validate() {
      fs.stat(src, function(error, stats) {
        assert.isDefined(error);
        done();
      });
    }

    renameFunction.call({
      files: [
        {
          src: [src]
        }
      ],
      async: function() {
        return function() {
          validate();
        };
      }
    });
  });

});
