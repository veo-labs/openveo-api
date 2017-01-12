'use strict';

var fs = require('fs');
var path = require('path');
var assert = require('chai').assert;
var renameTask = process.requireApi('lib/grunt/renameTask.js');
var fileSystem = process.requireApi('lib/fileSystem.js');

// renameTask.js
describe('renameTask', function() {
  var tmpDir = path.join(__dirname, 'tmp');
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
    renameFunction = renameTask(grunt);
  });

  // Create tmp directory
  beforeEach(function(done) {
    fileSystem.mkdir(tmpDir, function(error) {
      done();
    });
  });

  // Remove tmp directory
  afterEach(function(done) {
    fileSystem.rmdir(tmpDir, function(error) {
      done();
    });
  });

  describe('directory', function() {
    var src = path.join(tmpDir, 'dir');
    var dest = path.join(tmpDir, 'dirRenamed');

    // Create directory which will be renamed
    beforeEach(function(done) {
      fileSystem.mkdir(src, function(error) {
        done();
      });
    });

    it('should be able to rename a directory', function(done) {
      function validate() {
        fs.stat(dest, function(error, stats) {
          assert.isNotOk(error, 'Expected directory to be renamed');

          fs.stat(src, function(error, stats) {
            assert.isOk(error, 'Expected source directory to be removed');
            done();
          });
        });
      }

      renameFunction.call({
        files: [
          {
            src: [src],
            dest: dest
          }
        ],
        async: function() {
          return function() {
            validate();
          };
        }
      });
    });

    it('should abort if more than one source', function() {
      assert.throws(function() {
        renameFunction.call({
          files: [
            {
              src: [src, src],
              dest: dest
            }
          ],
          async: function() {
            return function() {};
          }
        });
      });
    });
  });

  describe('file', function() {
    var src = path.join(tmpDir, 'file.txt');
    var dest = path.join(tmpDir, 'renamedFile.txt');

    // Create file which will be renamed
    beforeEach(function(done) {
      fs.writeFile(src, 'File content', function() {
        done();
      });
    });

    it('should be able to rename a file', function(done) {
      function validate() {
        fs.stat(dest, function(error, stats) {
          assert.isNotOk(error, 'Expected file to be renamed');

          fs.stat(src, function(error, stats) {
            assert.isOk(error, 'Expected source file to be removed');
            done();
          });
        });
      }

      renameFunction.call({
        files: [
          {
            src: [src],
            dest: dest
          }
        ],
        async: function() {
          return function() {
            validate();
          };
        }
      });
    });

    it('should abort if more than one source', function() {
      assert.throws(function() {
        renameFunction.call({
          files: [
            {
              src: [src, src],
              dest: dest
            }
          ],
          async: function() {
            return function() {};
          }
        });
      });
    });
  });

});
