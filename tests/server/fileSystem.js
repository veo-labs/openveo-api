'use strict';

// Module dependencies
var path = require('path');
var fs = require('fs');
var async = require('async');
var assert = require('chai').assert;

// fileSystem.js
describe('fileSystem', function() {
  var fileSystem;

  // Initializes tests
  before(function() {
    fileSystem = process.requireAPI('lib/fileSystem.js');
  });

  // extract method
  describe('extract test', function() {

    it('Should be able to extract a tar file', function(done) {
      fileSystem.extract(path.join(__dirname, '/fileSystem/package.tar'), path.join(
        __dirname, '/fileSystem/package'), function(error) {
          if (!error)
            done();
          else
            assert.ok(false);
        });
    });

  });

  // mkdir method
  describe('mkdir', function() {

    it('Should be able to create a directory and parent directories', function(done) {
      fileSystem.mkdir(path.join(__dirname, '/fileSystem/test1/test2/test3'), function(error) {
        if (!error) {
          fileSystem.rmdir(path.join(__dirname, '/fileSystem/test1'), function() {
            done();
          });
        }
        else
          assert.ok(false);
      });
    });

  });

  // rmdir method
  describe('rmdir', function() {

    it('Should be able to recursively remove a directory with all its content', function(done) {
      fileSystem.rmdir(path.join(__dirname, '/fileSystem/package'), function(error) {
        if (!error)
          done();
        else
          assert.ok(false);
      });
    });

  });

  // getJSONFileContent method
  describe('getJSONFileContent', function() {

    it('Should be able to get a file content as JSON', function(done) {
      fileSystem.getJSONFileContent(path.join(__dirname, '/fileSystem/.session'), function(error, data) {
        if (!error) {
          assert.isObject(data);
          done();
        }
        else
          assert.ok(false);
      });
    });

  });

  // copy method
  describe('copy', function() {

    it('Should be able to copy a file', function(done) {
      fileSystem.copy(path.join(__dirname, '/fileSystem/.session'), path.join(
        __dirname, '/fileSystem/session/.sessionCopy'), function(error) {
          if (!error) {
            fileSystem.rmdir(path.join(__dirname, '/fileSystem/session'), function(error) {
              if (!error)
                done();
            });
          }
          else
            assert.ok(false);
        });
    });

    it('Should be able to copy a directory test', function(done) {
      fileSystem.copy(path.join(__dirname, '/fileSystem/dir1'), path.join(
        __dirname, '/fileSystem/dir1Copied'), function(error) {
          if (!error) {
            fileSystem.rmdir(path.join(__dirname, '/fileSystem/dir1Copied'), function(error) {
              if (!error)
                done();
            });
          }
          else
            assert.ok(false);
        });
    });

    it('Should be able to copy an empty directory', function(done) {
      async.series([

        // First create a directory
        function(callback) {
          fileSystem.mkdir(path.join(__dirname, '/fileSystem/toRemove'), callback);
        },

        // Copy directory
        function(callback) {
          fileSystem.copy(path.join(__dirname, '/fileSystem/toRemove'), path.join(
            __dirname, '/fileSystem/toRemoveCopied'), callback);
        },

        // Test if directory exists
        function(callback) {
          fs.exists(path.join(__dirname, '/fileSystem/toRemoveCopied'), function(exists) {
            callback((exists) ? null : new Error('Directory has not been copied'));
          });
        },

        // Remove copied directory
        function(callback) {
          fileSystem.rmdir(path.join(__dirname, '/fileSystem/toRemoveCopied'), callback);
        },

        // Remove directory
        function(callback) {
          fileSystem.rmdir(path.join(__dirname, '/fileSystem/toRemove'), callback);
        }
      ], function(error, results) {
        if (!error)
          done();
        else
          assert.ok(false);
      });
    });

  });

});
