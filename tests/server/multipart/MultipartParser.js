'use strict';

var path = require('path');
var chai = require('chai');
var spies = require('chai-spies');
var mock = require('mock-require');
var assert = chai.assert;

chai.should();
chai.use(spies);

describe('MultipartParser', function() {
  var MultipartParser;
  var parser;
  var fs;
  var fileSystem;
  var multer;
  var request;

  // Initiates mocks
  beforeEach(function() {
    fs = {
      stat: chai.spy(function(resourcePath, callback) {
        callback();
      })
    };

    fileSystem = {
      rm: chai.spy(function(resourcePath, callback) {
        callback();
      }),
      mkdir: chai.spy(function(directoryPath, callback) {
        callback();
      })
    };

    multer = chai.spy(function(options) {
      return multer;
    });
    multer.fields = chai.spy(function(fields) {
      return multer.middleware;
    });
    multer.middleware = chai.spy(function(request, response, next) {
      next();
    });
    multer.diskStorage = chai.spy(function(options) {});

    request = {
      on: chai.spy(function(event, callback) {})
    };

    mock('fs', fs);
    mock('multer', multer);
    mock(path.join(process.rootApi, 'lib/fileSystem.js'), fileSystem);
  });

  // Load module to test
  beforeEach(function() {
    MultipartParser = mock.reRequire(path.join(process.rootApi, 'lib/multipart/MultipartParser.js'));
  });

  it('should throw an error if request is not defined', function() {
    request = null;
    assert.throws(function() {
      new MultipartParser(null, []);
    }, TypeError);
  });

  describe('getField', function() {

    it('should find a field by its name', function() {
      var expectedFieldName = 'fieldName';
      var expectedFields = [
        {
          name: expectedFieldName,
          destinationPath: '/destination/path',
          maxCount: 1,
          unique: false
        }
      ];

      parser = new MultipartParser(request, expectedFields);

      assert.strictEqual(parser.getField(expectedFieldName), expectedFields[0], 'Wrong field');
    });

    it('should return null if not found', function() {
      var expectedFieldName = 'missingFieldName';
      var expectedFields = [];

      parser = new MultipartParser(request, expectedFields);

      assert.isNull(parser.getField(expectedFieldName), 'Unexpected field');
    });

  });

  describe('getFileName', function() {

    it('should generate a sanitized file name', function() {
      var expectedExtension = '.extension';
      var expectedOriginalName = 'file with special characters!';
      var expectedFileName = 'file-with-special-characters-';
      var expectedFieldName = 'fieldName';
      var expectedDestinationPath = '/destination/path';
      var expectedFields = [
        {
          name: expectedFieldName,
          destinationPath: expectedDestinationPath
        }
      ];
      parser = new MultipartParser(request, expectedFields);

      fs.stat = chai.spy(function(resourcePath, callback) {
        assert.equal(resourcePath, path.join(expectedDestinationPath, expectedFileName + expectedExtension));
        callback({
          code: 'ENOENT'
        });
      });

      parser.getFileName(expectedOriginalName + expectedExtension, expectedFieldName, function(error, fileName) {
        assert.isNull(error, 'Unexpected error');
        assert.equal(fileName, expectedFileName + expectedExtension, 'Wrong file name');
      });

      fs.stat.should.have.been.called.exactly(1);
    });

    it('should generate a unique file name if a file with the same name already exists', function() {
      var expectedExtension = '.extension';
      var expectedOriginalName = 'file';
      var expectedFieldName = 'fieldName';
      var expectedFields = [
        {
          name: expectedFieldName,
          destinationPath: '/destination/path'
        }
      ];

      parser = new MultipartParser(request, expectedFields);

      parser.getFileName(expectedOriginalName + expectedExtension, expectedFieldName, function(error, fileName) {
        assert.isNull(error, 'Unexpected error');
        assert.match(
          fileName,
          new RegExp('^' + expectedOriginalName + '-[^.]*' + expectedExtension.replace(/\./g, '\\.') + '$'),
          'Wrong file name'
        );
      });

      fs.stat.should.have.been.called.exactly(1);
    });

    it('should generate a unique file name if field is set as unique', function() {
      var expectedExtension = '.extension';
      var expectedOriginalName = 'file';
      var expectedFieldName = 'fieldName';
      var expectedFields = [
        {
          name: expectedFieldName,
          destinationPath: '/destination/path',
          unique: true
        }
      ];

      parser = new MultipartParser(request, expectedFields);

      parser.getFileName(expectedOriginalName + expectedExtension, expectedFieldName, function(error, fileName) {
        assert.isNull(error, 'Unexpected error');
        assert.match(
          fileName,
          new RegExp('^' + expectedOriginalName + '-[^.]*' + expectedExtension.replace(/\./g, '\\.') + '$'),
          'Wrong file name'
        );
      });

      fs.stat.should.have.been.called.exactly(0);
    });

    it('should execute callback with an error if detecting existing file failed', function() {
      var expectedError = new Error('Something went wrong');
      var expectedFieldName = 'fieldName';
      var expectedFields = [
        {
          name: expectedFieldName,
          destinationPath: '/destination/path'
        }
      ];

      parser = new MultipartParser(request, expectedFields);

      fs.stat = chai.spy(function(resourcePath, callback) {
        callback(expectedError);
      });

      parser.getFileName('file.extension', expectedFieldName, function(error, fileName) {
        assert.strictEqual(error, expectedError, 'Wrong error');
      });

      fs.stat.should.have.been.called.exactly(1);
    });

    it('should execute callback with an error if field destination path is not specified', function() {
      var expectedFieldName = 'fieldName';
      var expectedFields = [
        {
          name: expectedFieldName
        }
      ];

      parser = new MultipartParser(request, expectedFields);

      parser.getFileName('file.extension', expectedFieldName, function(error, fileName) {
        assert.instanceOf(error, Error, 'Wrong error');
      });

      fs.stat.should.have.been.called.exactly(0);
    });

  });

  describe('parse', function() {

    it('should parse request using Multer', function() {
      parser = new MultipartParser(request, []);

      parser.parse(function(error) {
        assert.isUndefined(error, 'Unexpected error');
      });

      multer.should.have.been.called.exactly(1);
      multer.fields.should.have.been.called.exactly(1);
      multer.middleware.should.have.been.called.exactly(1);
      multer.diskStorage.should.have.been.called.exactly(1);
    });

    it('should create destination folder if it does not exist', function() {
      var expectedFieldName = 'fieldName';
      var expectedDestinationPath = '/destination/path';
      var expectedFields = [
        {
          name: expectedFieldName,
          destinationPath: expectedDestinationPath
        }
      ];

      parser = new MultipartParser(request, expectedFields);

      multer.diskStorage = chai.spy(function(options) {
        options.destination(request, {fieldname: expectedFieldName}, function(error, destinationPath) {
          assert.isUndefined(error, 'Unexpected error');
          assert.strictEqual(destinationPath, expectedDestinationPath, 'Wrong destination path');
        });
      });

      parser.parse(function(error) {
        assert.isUndefined(error, 'Unexpected error');
      });

      multer.diskStorage.should.have.been.called.exactly(1);
      fileSystem.mkdir.should.have.been.called.exactly(1);
    });

    it('should execute callback with an error if creating destination folder failed', function() {
      var expectedError = new Error('Something went wrong');
      var expectedFieldName = 'fieldName';
      var expectedFields = [
        {
          name: expectedFieldName,
          destinationPath: '/destination/path'
        }
      ];

      parser = new MultipartParser(request, expectedFields);

      fileSystem.mkdir = chai.spy(function(directoryPath, callback) {
        callback(expectedError);
      });

      multer.diskStorage = chai.spy(function(options) {
        options.destination(request, {fieldname: expectedFieldName}, function(error, destinationPath) {
          assert.strictEqual(error, expectedError, 'Wrong error');
        });
      });

      parser.parse(function(error) {
        assert.isUndefined(error, 'Unexpected error');
      });

      multer.diskStorage.should.have.been.called.exactly(1);
      fileSystem.mkdir.should.have.been.called.exactly(1);
    });

    it('should execute callback with an error if destination path is not defined', function() {
      var expectedFieldName = 'fieldName';
      var expectedFields = [
        {
          name: expectedFieldName
        }
      ];

      parser = new MultipartParser(request, expectedFields);

      multer.diskStorage = chai.spy(function(options) {
        options.destination(request, {fieldname: expectedFieldName}, function(error, destinationPath) {
          assert.instanceOf(error, Error, 'Wrong error');
        });
      });

      parser.parse(function(error) {
        assert.isUndefined(error, 'Unexpected error');
      });

      multer.diskStorage.should.have.been.called.exactly(1);
      fileSystem.mkdir.should.have.been.called.exactly(0);
    });

    it('should validate a parsed file name', function() {
      var expectedFieldName = 'fieldName';
      var expectedFields = [
        {
          name: expectedFieldName,
          destinationPath: '/destination/path'
        }
      ];

      parser = new MultipartParser(request, expectedFields);

      parser.getFileName = chai.spy(parser.getFileName);
      multer.diskStorage = chai.spy(function(options) {
        options.filename(
          request, {
            fieldname: expectedFieldName,
            originalname: 'file.extension'
          },
          function(error, destinationPath) {
            assert.isNull(error, 'Unexpected error');
          }
        );
      });

      parser.parse(function(error) {
        assert.isUndefined(error, 'Unexpected error');
      });

      multer.diskStorage.should.have.been.called.exactly(1);
      parser.getFileName.should.have.been.called.exactly(1);
    });

    it('should execute callback with an error if file name validation failed', function() {
      var expectedError = new Error('Something went wrong');
      var expectedFieldName = 'fieldName';
      var expectedFields = [
        {
          name: expectedFieldName,
          destinationPath: '/destination/path'
        }
      ];

      parser = new MultipartParser(request, expectedFields);

      parser.getFileName = chai.spy(function(fileName, fieldName, callback) {
        callback(expectedError);
      });
      multer.diskStorage = chai.spy(function(options) {
        options.filename(
          request,
          {
            fieldname: expectedFieldName,
            originalname: 'file.extension'
          },
          function(error, destinationPath) {
            assert.strictEqual(error, expectedError, 'Wrong error');
          }
        );
      });

      parser.parse(function(error) {
        assert.isUndefined(error, 'Unexpected error');
      });

      multer.diskStorage.should.have.been.called.exactly(1);
      parser.getFileName.should.have.been.called.exactly(1);
    });

    it('should remove partially parsed files if request is aborted', function() {
      var abortCallback;
      var expectedFileName = 'file.extension';
      var expectedFieldName = 'fieldName';
      var expectedDestinationPath = '/destination/path';
      var expectedFields = [
        {
          name: expectedFieldName,
          destinationPath: expectedDestinationPath
        }
      ];

      multer.middleware = chai.spy(function(request, response, next) {});

      request.on = chai.spy(function(event, callback) {
        assert.equal(event, 'aborted', 'Wrong event');
        abortCallback = callback;
      });

      fileSystem.rm = chai.spy(function(resourcePath, callback) {
        assert.equal(resourcePath, expectedDestinationPath + '/' + expectedFileName, 'Wrong file to remove');
        callback();
      });

      multer.diskStorage = chai.spy(function(options) {
        options.filename(request, {fieldname: expectedFieldName, originalname: expectedFileName}, function() {});
      });

      parser = new MultipartParser(request, expectedFields);
      parser.getFileName = function(fileName, fieldName, callback) {
        callback(null, fileName);
      };
      parser.parse(function(error) {
        assert.instanceOf(error, Error, 'Wrong error');
      });

      abortCallback();

      multer.diskStorage.should.have.been.called.exactly(1);
      request.on.should.have.been.called.exactly(1);
      fileSystem.rm.should.have.been.called.exactly(1);
    });

  });

});
