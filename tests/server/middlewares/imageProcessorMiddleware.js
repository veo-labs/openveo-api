'use strict';

var path = require('path');
var fs = require('fs');
var async = require('async');
var assert = require('chai').assert;
var gm = require('gm').subClass({
  imageMagick: true
});
var fileSystem = process.requireApi('lib/fileSystem.js');
var imageProcessorMiddleware = process.requireApi('lib/middlewares/imageProcessorMiddleware.js');

/**
 * Converts image file size as returned by gm into a Number.
 *
 * gm returns file size with the unit (B, KB etc.). This will convert this
 * into Bytes.
 *
 * @param {String} fileSize The file size as returned by gm
 * @return {Number} The file size in Bytes, 0 if something went wrong
 */
function convertFileSizeIntoNumber(fileSize) {

  // Extract B or KB from the Number
  var fileSizeChunks = fileSize.match(/([0-9.]*)(.*)/);

  if (fileSizeChunks.length === 3) {
    var unit = fileSizeChunks[2];
    if (unit === 'B') return parseFloat(fileSizeChunks[1]);
    if (unit === 'KB') return parseFloat(fileSizeChunks[1]) * 1000;
  }

  return 0;
}

describe('imageProcessorMiddleware', function() {
  var imagesDirectoryPath = path.join(__dirname, 'resources');
  var imagesCachePath = path.join(__dirname, 'tmp/.cache');
  var imageTypes = ['jpg', 'png', 'gif'];
  var request;
  var response;

  beforeEach(function() {
    request = {
      query: {
        style: 'thumb-42'
      },
      url: '/JPG.jpg'
    };
    response = {
      set: function() {
      },
      download: function() {
      }
    };
  });

  // Remove tmp directory after each test
  afterEach(function(done) {
    async.parallel([
      function(callback) {
        fileSystem.rmdir(path.join(__dirname, '/tmp'), function(error) {
          callback();
        });
      },
      function(callback) {
        fileSystem.rmdir(path.join(__dirname, 'resources/.cache'), function(error) {
          callback();
        });
      }
    ], function(error) {
      done();
    });
  });

  // Build tests by image types
  imageTypes.forEach(function(imageType) {

    describe('with a ' + imageType + ' file', function() {
      var defaultImageSize;
      var defaultFileSize;

      // Set mocks
      beforeEach(function() {
        request = {
          query: {
            style: 'thumb-42'
          },
          url: '/' + imageType.toUpperCase() + '.' + imageType
        };
        response = {
          set: function() {
          },
          download: function() {
          }
        };
      });

      // Get file default information
      beforeEach(function(done) {
        var image = gm(path.join(imagesDirectoryPath, request.url));

        async.parallel([
          function(callback) {
            image.size(function(error, size) {
              defaultImageSize = size;
              callback();
            });
          },
          function(callback) {
            image.filesize(function(error, fileSize) {
              defaultFileSize = convertFileSizeIntoNumber(fileSize);
              callback();
            });
          }
        ], function(error) {
          done();
        });
      });

      it('should be able to generate a thumb', function(done) {
        var expectedHeaders = {
          'x-timestamp': Date.now()
        };
        var expectedWidth = 42;
        var middleware = imageProcessorMiddleware(
          imagesDirectoryPath,
          imagesCachePath,
          [
            {
              id: request.query.style,
              width: expectedWidth,
              quality: 100
            }
          ],
          expectedHeaders
        );

        request.query.filename = 'Expected file name';
        response = {
          set: function(headers) {
            assert.strictEqual(headers, expectedHeaders, 'Wrong headers');
          },
          download: function(imagePath, fileName) {
            assert.equal(imagePath, path.join(imagesCachePath, request.query.style, request.url));
            assert.equal(fileName, request.query.filename, 'Wrong file name');

            var image = gm(imagePath);

            async.parallel([
              function(callback) {
                image.size(function(error, size) {
                  if (error) return callback(error);
                  var imageRatio = size.width / size.height;
                  assert.equal(size.width, expectedWidth, 'Wrong image width');
                  assert.equal(imageRatio, defaultImageSize.width / defaultImageSize.height, 'Wrong image height');
                  callback();
                });
              },
              function(callback) {
                image.filesize(function(error, fileSize) {
                  if (error) return callback(error);
                  assert.isBelow(convertFileSizeIntoNumber(fileSize), defaultFileSize, 'Wrong file size');
                  callback();
                });
              }
            ], function(error) {
              assert.isNull(error, 'Unexpected error: ' + (error && error.message));
              done();
            });
          }
        };

        middleware(
          request,
          response,
          function() {
            assert.isOk(false, 'Unexpected call to next function');
            done();
          }
        );
      });

    });

  });

  it('should throw a TypeError if imagesDirectory is empty', function() {
    var emptyValues = [0, undefined, '', null];

    emptyValues.forEach(function(emptyValue) {
      assert.throws(function() {
        imageProcessorMiddleware(
          emptyValue,
          imagesCachePath,
          [{}],
          {}
        );
      }, TypeError, null, 'Expected an error to be thrown for empty value: ' + emptyValue);
    });
  });

  it('should throw a TypeError if styles is empty', function() {
    var emptyValues = [0, undefined, '', null, []];

    emptyValues.forEach(function(emptyValue) {
      assert.throws(function() {
        imageProcessorMiddleware(
          imagesDirectoryPath,
          imagesCachePath,
          emptyValue,
          {}
        );
      }, TypeError, null, 'Expected an error to be thrown for empty value: ' + emptyValue);
    });
  });

  it('should generate thumb in given cache directory', function(done) {
    var middleware = imageProcessorMiddleware(
      imagesDirectoryPath,
      imagesCachePath,
      [
        {
          id: 'thumb-42',
          width: 42,
          quality: 100
        }
      ]
    );

    response.download = function() {
      fs.stat(
        path.join(imagesCachePath, request.query.style, request.url),
        function(error, stat) {
          assert.isNull(error, 'Expected thumb to have been generated');
          assert.isOk(stat.isFile(), 'Expected resource to be a file');
          done();
        }
      );
    };

    middleware(
      request,
      response,
      function() {
        assert.isOk(false, 'Unexpected call to next function');
        done();
      }
    );
  });

  it('should be able to add response headers along with the image', function(done) {
    var headersSent;
    var expectedHeaders = {
      'first-header': 'first-header-value',
      'second-header': 'second-header-value'
    };
    var middleware = imageProcessorMiddleware(
      imagesDirectoryPath,
      imagesCachePath,
      [
        {
          id: 'thumb-42',
          width: 42,
          quality: 100
        }
      ],
      expectedHeaders
    );

    response.set = function(headers) {
      headersSent = headers;
    };

    response.download = function() {
      assert.strictEqual(headersSent, expectedHeaders);
      done();
    };

    middleware(
      request,
      response,
      function() {
        assert.isOk(false, 'Unexpected call to next function');
        done();
      }
    );
  });

  it('should skip image processor if style is not specified', function(done) {
    var middleware = imageProcessorMiddleware(
      imagesDirectoryPath,
      imagesCachePath,
      [
        {
          id: 'thumb-42',
          width: 42,
          quality: 100
        }
      ]
    );

    request.query.style = null;

    response.download = function() {
      assert.isOk(false, 'Unexpected call to download function');
    };

    middleware(
      request,
      response,
      function() {
        fs.stat(imagesCachePath, function(error, stat) {
          assert.isNotNull(error, 'Unexpected cache directory');
          done();
        });
      }
    );
  });

  it('should skip image processor if path does not correspond to an existing resource', function(done) {
    var middleware = imageProcessorMiddleware(
      imagesDirectoryPath,
      imagesCachePath,
      [
        {
          id: 'thumb-42',
          width: 42,
          quality: 100
        }
      ]
    );

    request.url = '/wrong-file';

    response.download = function() {
      assert.isOk(false, 'Unexpected call to download function');
    };

    middleware(
      request,
      response,
      function() {
        fs.stat(imagesCachePath, function(error, stat) {
          assert.isNotNull(error, 'Unexpected cache directory');
          done();
        });
      }
    );
  });

  it('should skip image processor if path does not correspond to a file', function(done) {
    var middleware = imageProcessorMiddleware(
      imagesDirectoryPath,
      imagesCachePath,
      [
        {
          id: 'thumb-42',
          width: 42,
          quality: 100
        }
      ]
    );

    request.url = '/';

    response.download = function() {
      assert.isOk(false, 'Unexpected call to download function');
    };

    middleware(
      request,
      response,
      function() {
        fs.stat(imagesCachePath, function(error, stat) {
          assert.isNotNull(error, 'Unexpected cache directory');
          done();
        });
      }
    );
  });

  it('should skip image processor if path does not correspond to an image', function(done) {
    var middleware = imageProcessorMiddleware(
      imagesDirectoryPath,
      imagesCachePath,
      [
        {
          id: 'thumb-42',
          width: 42,
          quality: 100
        }
      ]
    );

    request.url = '/text.txt';

    response.download = function() {
      assert.isOk(false, 'Unexpected call to download function');
    };

    middleware(
      request,
      response,
      function() {
        fs.stat(imagesCachePath, function(error, stat) {
          assert.isNotNull(error, 'Unexpected cache directory');
          done();
        });
      }
    );
  });

  it('should skip image processor if style is not part of supported styles', function(done) {
    var middleware = imageProcessorMiddleware(
      imagesDirectoryPath,
      imagesCachePath,
      [
        {
          id: 'thumb-42',
          width: 42,
          quality: 100
        }
      ]
    );

    request.query.style = 'invalid-style';

    response.download = function() {
      assert.isOk(false, 'Unexpected call to download function');
    };

    middleware(
      request,
      response,
      function() {
        fs.stat(imagesCachePath, function(error, stat) {
          assert.isNotNull(error, 'Unexpected cache directory');
          done();
        });
      }
    );
  });

});
