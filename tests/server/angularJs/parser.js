'use strict';

var path = require('path');
var fs = require('fs');

var assert = require('chai').assert;

var fileSystem = process.requireApi('lib/fileSystem.js');
var parser = process.requireApi('lib/angularJs/parser.js');

// parser.js
describe('parser', function() {

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

  // generateTemplatesCache method
  describe('generateTemplatesCache', function() {
    var expectedTemplateCacheFile = path.join(__dirname, '/resources/templateCache.js');
    var expectedTemplateCacheFileWithPrefix = path.join(__dirname, '/resources/templateCacheWithPrefix.js');
    var expectedTemplateCacheFileWithoutTemplate = path.join(__dirname, '/resources/templateCacheWithoutTemplate.js');
    var expectedTemplateContent;
    var templateCacheFile = path.join(__dirname, '/tmp/templateCache.js');
    var templatesFilesToCache = [
      path.join(__dirname, '/resources/templatesToCache/1.html'),
      path.join(__dirname, '/resources/templatesToCache/2.html')
    ];

    it('should be able to generate and AngularJS run script and cache HTML files', function(done) {
      fs.readFile(expectedTemplateCacheFile, function(error, buffer) {
        expectedTemplateContent = buffer.toString();

        parser.generateTemplatesCache(
          templatesFilesToCache,
          templateCacheFile,
          'test-module',
          null,
          function(error) {
            assert.isNull(error);

            fs.readFile(templateCacheFile, function(error, buffer) {
              assert.equal(buffer.toString(), expectedTemplateContent);
              done();
            });
          }
        );
      });
    });

    it('should be able to prefix HTML files names in templates cache', function(done) {
      fs.readFile(expectedTemplateCacheFileWithPrefix, function(error, buffer) {
        expectedTemplateContent = buffer.toString();

        parser.generateTemplatesCache(
          templatesFilesToCache,
          templateCacheFile,
          'test-module',
          'prefix',
          function(error) {
            assert.isNull(error);

            fs.readFile(templateCacheFile, function(error, buffer) {
              assert.equal(buffer.toString(), expectedTemplateContent);
              done();
            });
          }
        );
      });
    });

    it('should generate an empty AngularJS run script if no template specified', function(done) {
      fs.readFile(expectedTemplateCacheFileWithoutTemplate, function(error, buffer) {
        expectedTemplateContent = buffer.toString();

        parser.generateTemplatesCache(
          [],
          templateCacheFile,
          'test-module',
          null,
          function(error) {
            assert.isNull(error);

            fs.readFile(templateCacheFile, function(error, buffer) {
              assert.equal(buffer.toString(), expectedTemplateContent);
              done();
            });
          }
        );
      });
    });

    it('should execute callback with an error if moduleName is not specified', function(done) {
      parser.generateTemplatesCache(
        [],
        templateCacheFile,
        null,
        null,
        function(error) {
          assert.instanceOf(error, TypeError);
          done();
        }
      );
    });

    it('should create resulting file sub directories if necessary', function(done) {
      var expectedTemplateCacheFile = path.join(__dirname, '/tmp/dir1/dir2/templateCache.js');

      parser.generateTemplatesCache(
        [],
        expectedTemplateCacheFile,
        'test-module',
        null,
        function(error) {
          assert.isNull(error);

          fs.stat(expectedTemplateCacheFile, function(error, stat) {
            assert.ok(stat.isFile());
            done();
          });
        }
      );
    });

  });

});

