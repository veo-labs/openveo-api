'use strict';

var path = require('path');
var fs = require('fs');
var assert = require('chai').assert;
var fileSystem = process.requireApi('lib/fileSystem.js');

// fileSystem.js
describe('fileSystem', function() {

  // Create tmp directory before each test
  beforeEach(function(done) {
    fileSystem.mkdir(path.join(__dirname, '/tmp'), function() {
      done();
    });
  });

  // Remove tmp directory after each test
  afterEach(function(done) {
    fileSystem.rmdir(path.join(__dirname, '/tmp'), function(error) {
      done();
    });
  });

  // extract method
  describe('extract', function() {
    var tarFile = path.join(__dirname, '/resources/file.tar');
    var extractedDirectory = path.join(__dirname, '/tmp/extract');
    var tarContent = ['.session', 'slide_00000.jpeg', 'slide_00001.jpeg', 'synchro.xml'];

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
      fileSystem.extract(path.join(__dirname, '/resources/invalidTar.tar'), extractedDirectory, function(error) {
        if (error)
          done();
        else
          assert.ok(false, 'Expected an error');
      });
    });

  });

  // mkdir method
  describe('mkdir', function() {

    it('should be able to create a directory', function(done) {
      fileSystem.mkdir(path.join(__dirname, '/tmp/mkdir1/mkdir2/mkdir3'), function(error) {
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
    var directoryPath = path.join(__dirname, '/tmp/rmdir');

    // Create directory before each test
    beforeEach(function(done) {
      fileSystem.mkdir(directoryPath, function() {
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

  // rm method
  describe('rm', function() {

    it('should return an error in case of invalid resource path', function(done) {
      fileSystem.rm(null, function(error) {
        if (error)
          done();
        else
          assert.ok(false, 'Expected an error');
      });
    });

    describe('directory', function() {
      var directoryPath = path.join(__dirname, '/tmp/rm');

      // Create directory before each test
      beforeEach(function(done) {
        fileSystem.mkdir(directoryPath, function() {
          done();
        });
      });

      it('should be able to recursively remove a directory', function(done) {
        fileSystem.rm(directoryPath, function(error) {
          if (!error) {
            fs.exists(directoryPath, function(exists) {
              if (!exists)
                done();
              else
                assert.ok(false, 'Expected directory to be removed');
            });
          } else
            assert.ok(false, 'Remove directory failed: ' + error.message);
        });
      });
    });

    describe('file', function() {
      var filePath = path.join(__dirname, '/tmp/rm.txt');

      // Create file before each test
      beforeEach(function(done) {
        fs.writeFile(filePath, 'Something', {encoding: 'utf8'}, function() {
          done();
        });
      });

      it('should be able to remove a file', function(done) {
        fileSystem.rm(filePath, function(error) {
          if (!error) {
            fs.exists(filePath, function(exists) {
              if (!exists)
                done();
              else
                assert.ok(false, 'Expected file to be removed');
            });
          } else
            assert.ok(false, 'Remove file failed: ' + error.message);
        });
      });

    });
  });

  // getJSONFileContent method
  describe('getJSONFileContent', function() {
    var filePath = path.join(__dirname, '/resources/file.json');

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
    var filePath = path.join(__dirname, '/resources/file.json');
    var directoryPath = path.join(__dirname, '/resources/dir1');
    var copyDirPath = path.join(__dirname, '/tmp/copy');
    var copyFilePath = path.join(copyDirPath, 'file-copy.json');

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

  // readdir method
  describe('readdir', function() {

    it('should be able to read a directory recursively', function(done) {
      var expectedResources = [
        path.join(__dirname, '/resources/dir1/dir1.txt'),
        path.join(__dirname, '/resources/dir1/dir2'),
        path.join(__dirname, '/resources/dir1/dir2/dir2.txt'),
        path.join(__dirname, '/resources/dir1/dir2/dir3'),
        path.join(__dirname, '/resources/dir1/dir2/dir3/dir3.txt')
      ];

      fileSystem.readdir(path.join(__dirname, '/resources/dir1'), function(error, paths) {
        if (!error) {
          paths.forEach(function(resourcePath) {
            assert.oneOf(resourcePath.path, expectedResources);
          });
          done();
        } else
          assert.ok(false, 'readdir failed : ' + error.message);
      });
    });

    it('should execute callback with an error if directoryPath is not a String', function() {
      var invalidTypes = [42, {}, [], true];

      invalidTypes.forEach(function(invalidType) {
        fileSystem.readdir(invalidType, function(error) {
          assert.isDefined(error, 'Expected an error for directoryPath "' + invalidType + '"');
        });
      });
    });

    it('should execute callback with an error if directory does not exist', function(done) {
      fileSystem.readdir('wrong directory path', function(error) {
        assert.isDefined(error);
        done();
      });
    });

    it('should execute callback with an error if it is not a directory', function(done) {
      fileSystem.readdir(path.join(__dirname, '/resources/dir1/dir1.txt'), function(error) {
        assert.isDefined(error);
        done();
      });
    });

  });

  // readFile method
  describe('readFile', function() {

    it('should be able to read part of a file', function(done) {
      var filePath = path.join(__dirname, '/resources/files/GIF.gif');

      fs.readFile(filePath, function(error, data) {
        var expectedBytes = data.toString('hex', 1, 4);

        fileSystem.readFile(filePath, 1, 3, function(error, buffer) {
          assert.isNull(error);
          assert.equal(buffer.toString('hex'), expectedBytes);
          done();
        });
      });
    });

    it('should read all file if neither offset nor length is specified', function(done) {
      var filePath = path.join(__dirname, '/resources/files/GIF.gif');

      fs.readFile(filePath, function(error, data) {
        var expectedBytes = data.toString('hex');

        fileSystem.readFile(filePath, null, null, function(error, buffer) {
          assert.isNull(error);
          assert.equal(buffer.toString('hex'), expectedBytes);
          done();
        });
      });
    });

    it('should read the rest of the file if length is not specified', function(done) {
      var filePath = path.join(__dirname, '/resources/files/GIF.gif');

      fs.readFile(filePath, function(error, data) {
        var expectedBytes = data.toString('hex', 1, data.length);

        fileSystem.readFile(filePath, 1, null, function(error, buffer) {
          assert.isNull(error);
          assert.equal(buffer.toString('hex'), expectedBytes);
          done();
        });
      });
    });

    it('should start reading at 0 if offset is not specified', function(done) {
      var filePath = path.join(__dirname, '/resources/files/GIF.gif');

      fs.readFile(filePath, function(error, data) {
        var expectedBytes = data.toString('hex', 0, 4);

        fileSystem.readFile(filePath, null, 4, function(error, buffer) {
          assert.isNull(error);
          assert.equal(buffer.toString('hex'), expectedBytes);
          done();
        });
      });
    });

    it('should be able to read the file if bytes to read exceed the size of the file', function(done) {
      var filePath = path.join(__dirname, '/resources/files/GIF.gif');

      fs.readFile(filePath, function(error, data) {
        var expectedBytes = data.toString('hex');

        fileSystem.readFile(filePath, null, 42000000, function(error, buffer) {
          assert.isNull(error);
          assert.equal(buffer.toString('hex'), expectedBytes);
          done();
        });
      });
    });

    it('should execute callback with an error if file does not exist', function(done) {
      fileSystem.readFile('wrongFilePath', 1, 3, function(error, buffer) {
        assert.isDefined(error);
        done();
      });
    });

  });

  // getFileTypeFromBuffer method
  describe('getFileTypeFromBuffer', function() {
    var TYPES = [
      fileSystem.FILE_TYPES.JPG,
      fileSystem.FILE_TYPES.GIF,
      fileSystem.FILE_TYPES.PNG,
      fileSystem.FILE_TYPES.TAR,
      fileSystem.FILE_TYPES.MP4
    ];

    TYPES.forEach(function(TYPE) {

      it('should be able to get the file type from a buffer corresponding to a file of type ' + TYPE, function(done) {
        fs.readFile(
          path.join(__dirname, 'resources/files/' + TYPE.toUpperCase() + '.' + TYPE.toLowerCase()),
          function(error, data) {
            assert.equal(fileSystem.getFileTypeFromBuffer(data), TYPE);
            done();
          }
        );
      });

    });

    it('should return the unknown type if buffer does not correspond to a supported file', function() {
      assert.equal(fileSystem.getFileTypeFromBuffer(Buffer.from('Not a file')), fileSystem.FILE_TYPES.UNKNOWN);
    });
  });

});
