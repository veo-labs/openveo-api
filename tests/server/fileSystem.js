'use strict';

var path = require('path');
var fs = require('fs');
var assert = require('chai').assert;

// fileSystem.js
describe('fileSystem', function() {
  var fileSystem;

  before(function() {
    fileSystem = process.requireAPI('lib/fileSystem.js');
  });

  // extract method
  describe('extract', function() {
    var tarFile = path.join(__dirname, '/fileSystem/file.tar');
    var extractedDirectory = path.join(__dirname, '/fileSystem/extract');
    var tarContent = ['.session', 'slide_00000.jpeg', 'slide_00001.jpeg', 'synchro.xml'];

    // Remove extracted directory after each test
    afterEach(function(done) {
      fileSystem.rmdir(extractedDirectory, function(error) {
        done();
      });
    });

    it('should be able to extract a tar file', function(done) {
      fileSystem.extract(tarFile, extractedDirectory, function(error) {
        if (!error) {
          fs.readdir(extractedDirectory, function(error, tarFiles) {
            if (error)
              assert.ok(false, 'Failed reading extracted content : ' + error.message);
            else {
              assert.isDefined(tarFiles, 'Expected files in the tar');
              assert.sameMembers(tarFiles, tarContent, 'Unexpected tar content');
              done();
            }
          });
        } else
          assert.ok(false, 'Extraction failed : ' + error.message);
      });
    });

    it('should return an error in case of invalid tar file path', function(done) {
      fileSystem.extract(null, extractedDirectory, function(error) {
        if (error)
          done();
        else
          assert.ok(false, 'Expected an error');
      });
    });

    it('should return an error in case of invalid destination path', function(done) {
      fileSystem.extract(null, extractedDirectory, function(error) {
        if (error)
          done();
        else
          assert.ok(false, 'Expected an error');
      });
    });

    it('should return an error if the given tar file is not a valid tar', function(done) {
      fileSystem.extract(path.join(__dirname, '/fileSystem/invalidTar.tar'), extractedDirectory, function(error) {
        if (error)
          done();
        else
          assert.ok(false, 'Expected an error');
      });
    });

  });

  // mkdir method
  describe('mkdir', function() {

    // Remove created directory after each test
    afterEach(function(done) {
      fileSystem.rmdir(path.join(__dirname, '/fileSystem/mkdir1'), function() {
        done();
      });
    });

    it('should be able to create a directory', function(done) {
      fileSystem.mkdir(path.join(__dirname, '/fileSystem/mkdir1/mkdir2/mkdir3'), function(error) {
        if (!error)
          done();
        else
          assert.ok(false, 'Directory creation failed with message : ' + error.message);
      });
    });

    it('should return an error in case of invalid directory path', function(done) {
      fileSystem.mkdir(null, function(error) {
        if (error)
          done();
        else
          assert.ok(false, 'Expected an error');
      });
    });

  });

  // rmdir method
  describe('rmdir', function() {
    var directoryPath = path.join(__dirname, '/fileSystem/rmdir');

    // Create directory before each test
    beforeEach(function(done) {
      fileSystem.mkdir(directoryPath, function() {
        done();
      });
    });

    // Remove created directory after each test
    afterEach(function(done) {
      fileSystem.rmdir(directoryPath, function() {
        done();
      });
    });

    it('should be able to recursively remove a directory with all its content', function(done) {
      fileSystem.rmdir(directoryPath, function(error) {
        if (!error) {
          fs.exists(directoryPath, function(exists) {
            if (!exists)
              done();
            else
              assert.ok(false, 'Expected directory to be removed');
          });
        } else
          assert.ok(false, 'Remove directory failed : ' + error.message);
      });
    });

    it('should return an error in case of invalid directory path', function(done) {
      fileSystem.rmdir(null, function(error) {
        if (error)
          done();
        else
          assert.ok(false, 'Expected an error');
      });
    });

  });

  // getJSONFileContent method
  describe('getJSONFileContent', function() {
    var filePath = path.join(__dirname, '/fileSystem/file.json');

    it('should be able to get a file content as JSON', function(done) {
      fileSystem.getJSONFileContent(filePath, function(error, data) {
        if (!error) {
          assert.deepEqual(data, require(filePath));
          done();
        } else
          assert.ok(false, 'getJSONFileContent failed : ' + error.message);
      });
    });

    it('should return an error in case of invalid file path', function(done) {
      fileSystem.getJSONFileContent(null, function(error) {
        if (error)
          done();
        else
          assert.ok(false, 'Expected an error');
      });
    });

    it('should return an error in case of invalid file', function(done) {
      fileSystem.getJSONFileContent('invalidFile', function(error) {
        if (error)
          done();
        else
          assert.ok(false, 'Expected an error');
      });
    });

  });

  // copy method
  describe('copy', function() {
    var filePath = path.join(__dirname, '/fileSystem/file.json');
    var directoryPath = path.join(__dirname, '/fileSystem/dir1');
    var copyDirPath = path.join(__dirname, '/fileSystem/copy');
    var copyFilePath = path.join(copyDirPath, 'file-copy.json');

    // Remove copied directory after each test
    afterEach(function(done) {
      fileSystem.rmdir(copyDirPath, function() {
        done();
      });
    });

    /**
     * Gets directory tree.
     *
     * @param {String} directoryPath Path to the directory to read
     * @param {Function} callback Function to call when its done with
     *  - **Array** The list of files in the tree
     */
    function getDirectoryTree(directoryPath, callback) {
      var tree = [];
      fs.readdir(directoryPath, function(error, resources) {
        var pendingResourceNumber = resources.length;

        if (!pendingResourceNumber) {
          callback(tree);
          return;
        }

        resources.forEach(function(resource) {
          var resourcePath = path.join(directoryPath, resource);
          fs.stat(resourcePath, function(error, stats) {
            tree.push(resource);

            if (stats.isFile()) {
              pendingResourceNumber--;

              if (!pendingResourceNumber)
                callback(tree);
            } else {
              getDirectoryTree(resourcePath, function(subTree) {
                tree = tree.concat(subTree);

                pendingResourceNumber--;
                if (!pendingResourceNumber)
                  callback(tree);
              });
            }
          });
        });
      });
    }

    it('should be able to copy a file', function(done) {
      fileSystem.copy(filePath, copyFilePath, function(error) {
        if (!error) {
          var originalFile = require(filePath);
          var copy = require(copyFilePath);
          assert.deepEqual(originalFile, copy, 'Expected copy to have the same content');
          done();
        } else
          assert.ok(false, 'Copy failed : ' + error.message);
      });
    });

    it('should be able to copy a directory', function(done) {
      fileSystem.copy(directoryPath, copyDirPath, function(error) {
        if (!error) {
          getDirectoryTree(directoryPath, function(tree) {
            getDirectoryTree(copyDirPath, function(copyTree) {
              assert.sameMembers(tree, copyTree, 'Expected copy directory to have same resources as the original');
              done();
            });
          });
        } else
          assert.ok(false);
      });
    });

  });

});
