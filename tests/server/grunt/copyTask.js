'use strict';

var fs = require('fs');
var path = require('path');
var assert = require('chai').assert;
var copyTask = process.requireApi('lib/grunt/copyTask.js');
var fileSystem = process.requireApi('lib/fileSystem.js');

// copyTask.js
describe('copyTask', function() {
  var fileName = 'file.txt';
  var directoryName = 'directory';
  var fileContent = 'File content';
  var temporaryDirectoryPath = path.join(__dirname, 'tmp');
  var directoryPath = path.join(temporaryDirectoryPath, directoryName);
  var filePath = path.join(directoryPath, fileName);
  var destinationDirectoryPath = path.join(temporaryDirectoryPath, 'directory-copied');
  var grunt;
  var copyFunction;

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
      log: {
        oklns: function() {}
      }
    };
  });

  // Prepare tests
  beforeEach(function() {
    copyFunction = copyTask(grunt);
  });

  // Create directory and file to copy
  beforeEach(function(done) {
    fileSystem.mkdir(directoryPath, function(error) {
      fs.writeFile(filePath, fileContent, function(error) {
        if (error) throw error;
        done();
      });
    });
  });

  // Remove tmp directory
  afterEach(function(done) {
    fileSystem.rmdir(temporaryDirectoryPath, function(error) {
      done();
    });
  });

  it('should be able to copy a directory and its files', function(done) {
    function validate() {
      fs.stat(destinationDirectoryPath, function(error, stats) {
        assert.ok(stats.isDirectory(), 'Expected a directory');

        fs.readFile(path.join(destinationDirectoryPath, directoryName, fileName), function(error, data) {
          assert.equal(data, fileContent, 'Wrong file content');
          done();
        });
      });
    }

    copyFunction.call({
      files: [
        {
          src: [directoryPath],
          dest: destinationDirectoryPath
        }
      ],
      async: function() {
        return function() {
          validate();
        };
      }
    });
  });

  it('should throw an error if copy failed', function(done) {
    copyFunction.call({
      files: [
        {
          src: ['Wrong source path'],
          dest: 'Wrong destination path'
        }
      ],
      async: function() {
        return function() {
          assert.ok(false, 'Unexpected success');
        };
      }
    });

    grunt.fail.fatal = function() {
      done();
    };
  });

});
