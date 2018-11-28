'use strict';

var os = require('os');
var path = require('path');
var chai = require('chai');
var spies = require('chai-spies');
var mock = require('mock-require');
var assert = chai.assert;

chai.should();
chai.use(spies);

describe('imageProcessor', function() {
  var fileSystem;
  var imageProcessor;
  var gm;

  // Initiates mocks
  beforeEach(function() {
    fileSystem = {
      rm: chai.spy(function(resourcePath, callback) {
        callback();
      }),
      mkdir: chai.spy(function(directoryPath, callback) {
        callback();
      })
    };

    gm = {
      constructor: function() {
        return gm;
      },
      subClass: function() {
        return gm.constructor;
      },
      size: chai.spy(function(callback) {
        callback(null, {width: 142, height: 42});
      }),
      noProfile: chai.spy(function(callback) {
        return gm;
      }),
      quality: chai.spy(function(quality) {
        return gm;
      }),
      resizeExact: chai.spy(function(width, height) {
        return gm;
      }),
      crop: chai.spy(function(width, height, x, y) {
        return gm;
      }),
      append: chai.spy(function(imagePath, horizontally) {
        return gm;
      }),
      write: chai.spy(function(imagePath, callback) {
        callback();
      })
    };

    mock('gm', gm);
    mock(path.join(process.rootApi, 'lib/fileSystem.js'), fileSystem);
  });

  // Load module to test
  beforeEach(function() {
    imageProcessor = mock.reRequire(path.join(process.rootApi, 'lib/imageProcessor.js'));
  });

  beforeEach(function() {
    imageProcessor.generateThumbnail = chai.spy(
      function(imagePath, thumbnailPath, width, height, crop, quality, callback) {
        callback();
      }
    );
  });

  describe('aggregate', function() {

    it('should generate a thumbnail for each image and aggregate them into a single image', function(done) {
      var expectedImages = ['image1', 'image2'];
      var expectedDestinationPath = 'destination/path';
      var expectedWidth = 142;
      var expectedHeight = 42;
      var expectedHorizontality = true;
      var expectedQuality = 50;
      var expectedTemporaryDirectoryPath = '/tmp/path';

      imageProcessor.generateThumbnail = chai.spy(
        function(imagePath, thumbnailPath, width, height, crop, quality, callback) {
          assert.include(expectedImages, imagePath, 'Wrong image path');
          assert.match(thumbnailPath, new RegExp('^' + expectedTemporaryDirectoryPath), 'Wrong thumbnail path');
          assert.equal(width, expectedWidth, 'Wrong width');
          assert.equal(height, expectedHeight, 'Wrong height');
          assert.ok(crop, 'Expected thumbnail to be cropped');
          assert.equal(quality, 100, 'Wrong quality');
          callback();
        }
      );

      gm.append = chai.spy(function(imagePath, horizontally) {
        assert.match(imagePath, new RegExp('^' + expectedTemporaryDirectoryPath), 'Wrong image path');
        assert.equal(expectedHorizontality, horizontally, 'Wrong horizontality');
        return gm;
      });

      gm.quality = chai.spy(function(quality) {
        assert.equal(quality, expectedQuality, 'Wrong quality');
        return gm;
      });

      gm.write = chai.spy(function(imagePath, callback) {
        assert.equal(imagePath, expectedDestinationPath, 'Wrong final image path');
        callback();
      });

      imageProcessor.aggregate(
        expectedImages,
        expectedDestinationPath,
        expectedWidth,
        expectedHeight,
        expectedHorizontality,
        expectedQuality,
        expectedTemporaryDirectoryPath,
        function(error, results) {
          assert.isNull(error, 'Unexpected error');
          imageProcessor.generateThumbnail.should.have.been.called.exactly(expectedImages.length);
          gm.quality.should.have.been.called.exactly(1);
          gm.append.should.have.been.called.exactly(expectedImages.length - 1);
          gm.write.should.have.been.called.exactly(1);

          for (var i = 0; i < results.length; i++) {
            var image = results[i];
            assert.equal(image.sprite, expectedDestinationPath, 'Wrong sprite for image ' + i);
            assert.equal(image.image, expectedImages[i], 'Wrong image for image ' + i);
            assert.equal(image.x, expectedWidth * i, 'Wrong x coordinate for image ' + i);
            assert.equal(image.y, 0, 'Wrong y coordinate for image ' + i);
          }

          done();
        }
      );
    });

    it('should be able to aggregate images vertically', function(done) {
      var expectedImages = ['image1', 'image2'];
      var expectedDestinationPath = 'destination/path';
      var expectedHeight = 42;

      imageProcessor.aggregate(
        expectedImages,
        expectedDestinationPath,
        142,
        expectedHeight,
        false,
        50,
        '/tmp/path',
        function(error, results) {
          assert.isNull(error, 'Unexpected error');
          imageProcessor.generateThumbnail.should.have.been.called.exactly(expectedImages.length);

          for (var i = 0; i < results.length; i++) {
            var image = results[i];
            assert.equal(image.sprite, expectedDestinationPath, 'Wrong sprite for image ' + i);
            assert.equal(image.image, expectedImages[i], 'Wrong image for image ' + i);
            assert.equal(image.x, 0, 'Wrong x coordinate for image ' + i);
            assert.equal(image.y, expectedHeight * i, 'Wrong y coordinate for image ' + i);
          }

          done();
        }
      );
    });

    it('should set default quality to 90', function(done) {
      gm.quality = chai.spy(function(quality) {
        assert.equal(quality, 90, 'Wrong quality');
        return gm;
      });

      imageProcessor.aggregate(
        ['image1', 'image2'],
        'destination/path',
        142,
        42,
        false,
        null,
        '/tmp/path',
        function(error, results) {
          assert.isNull(error, 'Unexpected error');
          done();
        }
      );
    });

    it('should use system temporary directory as temporary directory by default', function(done) {
      imageProcessor.generateThumbnail = chai.spy(
        function(imagePath, thumbnailPath, width, height, crop, quality, callback) {
          assert.match(thumbnailPath, new RegExp('^' + os.tmpdir()), 'Wrong image path');
          callback();
        }
      );

      imageProcessor.aggregate(
        ['image1'],
        'destination/path',
        142,
        42,
        false,
        null,
        null,
        function(error, results) {
          assert.isNull(error, 'Unexpected error');
          imageProcessor.generateThumbnail.should.have.been.called.exactly(1);
          done();
        }
      );
    });

    it('should create destination directory', function(done) {
      var expectedDestinationPath = 'destination/path';

      fileSystem.mkdir = chai.spy(function(directoryPath, callback) {
        assert.equal(directoryPath, path.dirname(expectedDestinationPath), 'Wrong directory path');
        callback();
      });

      imageProcessor.aggregate(
        ['image1'],
        expectedDestinationPath,
        142,
        42,
        false,
        null,
        null,
        function(error, results) {
          assert.isNull(error, 'Unexpected error');
          fileSystem.mkdir.should.have.been.called.exactly(1);
          done();
        }
      );
    });

    it('should remove temporary directory when finished', function(done) {
      var expectedTemporaryDirectoryPath = 'destination/path';

      fileSystem.rm = chai.spy(function(directoryPath, callback) {
        assert.match(directoryPath, new RegExp('^' + expectedTemporaryDirectoryPath), 'Wrong temporary directory');
        callback();
      });

      imageProcessor.aggregate(
        ['image1'],
        'destination/path',
        142,
        42,
        false,
        null,
        expectedTemporaryDirectoryPath,
        function(error, results) {
          assert.isNull(error, 'Unexpected error');
          fileSystem.rm.should.have.been.called.exactly(1);
          done();
        }
      );
    });

    it('should execute callback with an error if removing temporary directory failed', function(done) {
      var expectedError = new Error('Something went wrong');

      fileSystem.rm = chai.spy(function(directoryPath, callback) {
        callback(expectedError);
      });

      imageProcessor.aggregate(['image1'], 'destination/path', 142, 42, false, null, null, function(error, results) {
        assert.strictEqual(error, expectedError, 'Wrong error');
        fileSystem.rm.should.have.been.called.exactly(1);
        done();
      });
    });

    it('should execute callback with an error if creating destination directory failed', function(done) {
      var expectedError = new Error('Something went wrong');

      fileSystem.mkdir = chai.spy(function(directoryPath, callback) {
        callback(expectedError);
      });

      imageProcessor.aggregate(['image1'], 'destination/path', 142, 42, false, null, null, function(error, results) {
        assert.strictEqual(error, expectedError, 'Wrong error');
        fileSystem.mkdir.should.have.been.called.exactly(1);
        done();
      });
    });

    it('should execute callback with an error if generating thumbnails failed', function(done) {
      var expectedError = new Error('Something went wrong');

      imageProcessor.generateThumbnail = chai.spy(
        function(imagePath, thumbnailPath, width, height, crop, quality, callback) {
          callback(expectedError);
        }
      );

      imageProcessor.aggregate(['image1'], 'destination/path', 142, 42, false, null, null, function(error, results) {
        assert.strictEqual(error, expectedError, 'Wrong error');
        imageProcessor.generateThumbnail.should.have.been.called.exactly(1);
        done();
      });
    });

    it('should execute callback with an error if creating final image failed', function(done) {
      var expectedError = new Error('Something went wrong');

      gm.write = chai.spy(function(imagePath, callback) {
        callback(expectedError);
      });

      imageProcessor.aggregate(['image1'], 'destination/path', 142, 42, false, null, null, function(error, results) {
        assert.strictEqual(error, expectedError, 'Wrong error');
        gm.write.should.have.been.called.exactly(1);
        done();
      });
    });

  });

  describe('generateSprite', function() {

    it('should generate a sprite from a list of images', function(done) {
      var expectedImagesPaths = ['image1', 'image2', 'image3', 'image4'];
      var expectedDestinationPath = 'destination/path';
      var expectedWidth = 142;
      var expectedHeight = 42;
      var expectedTotalColumns = 2;
      var expectedMaxRows = 2;
      var expectedQuality = 50;
      var expectedTemporaryDirectoryPath = '/tmp/path';
      var expectedNumberOfColumns = Math.min(expectedImagesPaths.length, expectedTotalColumns);
      var expectedNumberOfRows = Math.ceil(expectedImagesPaths.length / expectedNumberOfColumns);

      imageProcessor.aggregate = chai.spy(imageProcessor.aggregate);

      imageProcessor.generateSprite(
        expectedImagesPaths,
        expectedDestinationPath,
        expectedWidth,
        expectedHeight,
        expectedTotalColumns,
        expectedMaxRows,
        expectedQuality,
        expectedTemporaryDirectoryPath,
        function(error, results) {
          assert.isNull(error, 'Unexpected error');
          imageProcessor.aggregate.should.have.been.called.exactly(expectedNumberOfRows + 1);

          assert.lengthOf(results, expectedImagesPaths.length, 'Wrong number of images');

          assert.equal(results[0].sprite, expectedDestinationPath, 'Wrong sprite for image ' + results[0].image);
          assert.equal(results[0].image, expectedImagesPaths[0], 'Wrong image for image ' + results[0].image);
          assert.equal(results[0].x, 0, 'Wrong x coordinate for image ' + results[0].image);
          assert.equal(results[0].y, 0, 'Wrong y coordinate for image ' + results[0].image);

          assert.equal(results[1].sprite, expectedDestinationPath, 'Wrong sprite for image ' + results[1].image);
          assert.equal(results[1].image, expectedImagesPaths[1], 'Wrong image for image ' + results[1].image);
          assert.equal(results[1].x, expectedWidth, 'Wrong x coordinate for image ' + results[1].image);
          assert.equal(results[1].y, 0, 'Wrong y coordinate for image ' + results[1].image);

          assert.equal(results[2].sprite, expectedDestinationPath, 'Wrong sprite for image ' + results[2].image);
          assert.equal(results[2].image, expectedImagesPaths[2], 'Wrong image for image ' + results[2].image);
          assert.equal(results[2].x, 0, 'Wrong x coordinate for image ' + results[2].image);
          assert.equal(results[2].y, expectedHeight, 'Wrong y coordinate for image ' + results[2].image);

          assert.equal(results[3].sprite, expectedDestinationPath, 'Wrong sprite for image ' + results[3].image);
          assert.equal(results[3].image, expectedImagesPaths[3], 'Wrong image for image ' + results[3].image);
          assert.equal(results[3].x, expectedWidth, 'Wrong x coordinate for image ' + results[3].image);
          assert.equal(results[3].y, expectedHeight, 'Wrong y coordinate for image ' + results[3].image);

          done();
        }
      );
    });

    it('should set default grid to 5x5', function(done) {
      var expectedImagesPaths = [];
      var expectedWidth = 142;
      var expectedHeight = 42;
      for (var i = 0; i < 25; i++) expectedImagesPaths.push('image' + i);

      imageProcessor.generateSprite(
        expectedImagesPaths,
        'destination/path',
        expectedWidth,
        expectedHeight,
        null,
        null,
        50,
        '/tmp/path',
        function(error, results) {
          assert.isNull(error, 'Unexpected error');
          assert.lengthOf(results, expectedImagesPaths.length, 'Wrong number of images in the sprite');

          var line = -1;
          var column = 0;
          for (var i = 0; i < results.length; i++) {
            if (i % 5 === 0) {
              line++;
              column = 0;
            }

            assert.equal(results[i].y, line * expectedHeight, 'Wrong y coordinate for image ' + results[i].image);
            assert.equal(results[i].x, column * expectedWidth, 'Wrong x coordinate for image ' + results[i].image);
            column++;
          }
          done();
        }
      );
    });

    it('should set default quality to 90', function(done) {
      var expectedDestinationPath = 'destination/path';
      var expectedMaxRows = 1;

      imageProcessor.aggregate = chai.spy(function(imagesPaths, destinationPath, width, height, horizontally, quality,
        temporaryDirectoryPath, callback) {
        if (destinationPath === expectedDestinationPath)
          assert.equal(quality, 90, 'Wrong quality');

        callback(null, []);
      });

      imageProcessor.generateSprite(
        ['image1', 'image2'],
        expectedDestinationPath,
        142,
        42,
        1,
        expectedMaxRows,
        null,
        '/tmp/path',
        function(error, results) {
          assert.isNull(error, 'Unexpected error');
          imageProcessor.aggregate.should.have.been.called.exactly(expectedMaxRows + 1);
          done();
        }
      );
    });

    it('should set default temporary directory to the system temporary directory', function(done) {
      imageProcessor.aggregate = chai.spy(function(imagesPaths, destinationPath, width, height, horizontally, quality,
        temporaryDirectoryPath, callback) {
        assert.match(temporaryDirectoryPath, new RegExp('^' + os.tmpdir()), 'Wrong temporary directory');
        callback(null, []);
      });

      imageProcessor.generateSprite(
        ['image1', 'image2'],
        'destination/path',
        142,
        42,
        1,
        1,
        50,
        null,
        function(error, results) {
          assert.isNull(error, 'Unexpected error');
          imageProcessor.aggregate.should.have.been.called.exactly(2);
          done();
        }
      );
    });

    it('should ignore extra images that exceed the maximum number of images in the grid', function(done) {
      var expectedImagesPaths = ['image1', 'image2', 'image3', 'image4'];
      var expectedTotalColumns = 2;
      var expectedMaxRows = 1;

      imageProcessor.generateSprite(
        expectedImagesPaths,
        'destination/path',
        142,
        42,
        expectedTotalColumns,
        expectedMaxRows,
        50,
        null,
        function(error, results) {
          assert.isNull(error, 'Unexpected error');
          assert.lengthOf(
            results,
            expectedImagesPaths.length - (expectedTotalColumns * expectedMaxRows),
            'Wrong number of images in the sprite'
          );
          done();
        }
      );
    });

    it('should create transparent images to complete the grid if not enough images', function(done) {
      var transparentImageCreated = false;
      var expectedImagesPaths = ['image1', 'image2', 'image3'];

      gm.write = chai.spy(function(imagePath, callback) {
        if (new RegExp('transparent.png$').test(imagePath))
          transparentImageCreated = true;

        callback();
      });

      imageProcessor.generateSprite(
        expectedImagesPaths,
        'destination/path',
        142,
        42,
        2,
        2,
        50,
        null,
        function(error, results) {
          assert.isNull(error, 'Unexpected error');
          gm.write.should.have.been.called.at.least(1);
          assert.lengthOf(results, expectedImagesPaths.length, 'Unexpected transparent image in the results');
          assert.ok(transparentImageCreated, 'Expected a transparent image to have been created');
          done();
        }
      );
    });

    it('should create destination directory', function(done) {
      var expectedDestinationPath = 'destination/path';
      var destinationDirectoryCreated = false;

      fileSystem.mkdir = chai.spy(function(directoryPath, callback) {
        if (directoryPath === path.dirname(expectedDestinationPath))
          destinationDirectoryCreated = true;

        callback();
      });

      imageProcessor.generateSprite(
        ['image1', 'image2'],
        expectedDestinationPath,
        142,
        42,
        2,
        1,
        50,
        null,
        function(error, results) {
          assert.isNull(error, 'Unexpected error');
          fileSystem.mkdir.should.have.been.called.at.least(1);
          assert.ok(destinationDirectoryCreated, 'Expected destination directory to be created');
          done();
        }
      );
    });

    it('should create temporary directory', function(done) {
      var expectedTemporyDirectoryPath = 'destination/path';
      var temporaryDirectoryCreated = false;

      fileSystem.mkdir = chai.spy(function(directoryPath, callback) {
        if (directoryPath === path.dirname(expectedTemporyDirectoryPath))
          temporaryDirectoryCreated = true;

        callback();
      });

      imageProcessor.generateSprite(
        ['image1', 'image2'],
        expectedTemporyDirectoryPath,
        142,
        42,
        2,
        1,
        50,
        null,
        function(error, results) {
          assert.isNull(error, 'Unexpected error');
          fileSystem.mkdir.should.have.been.called.at.least(1);
          assert.ok(temporaryDirectoryCreated, 'Expected temporary directory to be created');
          done();
        }
      );
    });

    it('should remove temporary directory when finished', function(done) {
      var expectedDestinationPath = '/destination/path';
      var expectedTemporaryDirectoryPath = '/tmp/path';
      var temporaryDirectoryRemoved = false;

      fileSystem.rm = chai.spy(function(directoryPath, callback) {
        if (new RegExp('^' + expectedTemporaryDirectoryPath + '/[^/]*$').test(directoryPath))
          temporaryDirectoryRemoved = true;

        callback();
      });

      imageProcessor.generateSprite(
        ['image1', 'image2'],
        expectedDestinationPath,
        142,
        42,
        2,
        1,
        50,
        expectedTemporaryDirectoryPath,
        function(error, results) {
          assert.isNull(error, 'Unexpected error');
          fileSystem.rm.should.have.been.called.at.least(1);
          assert.ok(temporaryDirectoryRemoved, 'Expected temporary directory to have been removed');
          done();
        }
      );
    });

    it('should execute callback with an error if creating destination directory failed', function(done) {
      var expectedDestinationPath = 'destination/path';
      var expectedError = new Error('Something went wrong');

      fileSystem.mkdir = chai.spy(function(directoryPath, callback) {
        if (directoryPath === path.dirname(expectedDestinationPath))
          return callback(expectedError);

        callback();
      });

      imageProcessor.generateSprite(
        ['image1', 'image2'],
        expectedDestinationPath,
        142,
        42,
        2,
        1,
        50,
        null,
        function(error, results) {
          assert.strictEqual(error, expectedError, 'Wrong error');
          fileSystem.mkdir.should.have.been.called.at.least(1);
          done();
        }
      );
    });

    it('should execute callback with an error if creating temporary directory failed', function(done) {
      var expectedTemporaryDirectoryPath = '/tmp/path';
      var expectedError = new Error('Something went wrong');

      fileSystem.mkdir = chai.spy(function(directoryPath, callback) {
        if (new RegExp('^' + expectedTemporaryDirectoryPath).test(directoryPath))
          return callback(expectedError);

        callback();
      });

      imageProcessor.generateSprite(
        ['image1', 'image2'],
        'destination/path',
        142,
        42,
        2,
        1,
        50,
        expectedTemporaryDirectoryPath,
        function(error, results) {
          assert.strictEqual(error, expectedError, 'Wrong error');
          fileSystem.mkdir.should.have.been.called.at.least(1);
          done();
        }
      );
    });

    it('should execute callback with an error if creating transparent image failed', function(done) {
      var expectedError = new Error('Something went wrong');

      gm.write = chai.spy(function(imagePath, callback) {
        if (new RegExp('transparent.png$').test(imagePath))
          return callback(expectedError);

        callback();
      });

      imageProcessor.generateSprite(
        ['image1', 'image2', 'image3'],
        'destination/path',
        142,
        42,
        2,
        2,
        50,
        null,
        function(error, results) {
          assert.strictEqual(error, expectedError, 'Wrong error');
          gm.write.should.have.been.called.at.least(1);
          done();
        }
      );
    });

    it('should execute callback with an error if creating a line failed', function(done) {
      var expectedError = new Error('Something went wrong');

      gm.write = chai.spy(function(imagePath, callback) {
        if (new RegExp('line-[0-9]+$').test(imagePath))
          return callback(expectedError);

        callback();
      });

      imageProcessor.generateSprite(
        ['image1', 'image2'],
        'destination/path',
        142,
        42,
        2,
        1,
        50,
        null,
        function(error, results) {
          assert.strictEqual(error, expectedError, 'Wrong error');
          gm.write.should.have.been.called.at.least(1);
          done();
        }
      );
    });

    it('should execute callback with an error if aggregating lines failed', function(done) {
      var expectedDestinationPath = '/destination/path';
      var expectedError = new Error('Something went wrong');

      gm.write = chai.spy(function(imagePath, callback) {
        if (imagePath === expectedDestinationPath)
          return callback(expectedError);

        callback();
      });

      imageProcessor.generateSprite(
        ['image1', 'image2'],
        expectedDestinationPath,
        142,
        42,
        2,
        1,
        50,
        null,
        function(error, results) {
          assert.strictEqual(error, expectedError, 'Wrong error');
          gm.write.should.have.been.called.at.least(1);
          done();
        }
      );
    });

    it('should execute callback with an error if removing temporary directory failed', function(done) {
      var expectedTemporaryDirectoryPath = '/tmp/path';
      var expectedError = new Error('Something went wrong');

      fileSystem.rm = chai.spy(function(directoryPath, callback) {
        if (new RegExp('^' + expectedTemporaryDirectoryPath + '/[^/]*$').test(directoryPath)) {
          return callback(expectedError);
        }
        callback();
      });

      imageProcessor.generateSprite(
        ['image1', 'image2'],
        '/destination/path',
        142,
        42,
        2,
        1,
        50,
        expectedTemporaryDirectoryPath,
        function(error, results) {
          assert.strictEqual(error, expectedError, 'Wrong error');
          fileSystem.rm.should.have.been.called.at.least(1);
          done();
        }
      );
    });

  });

  describe('generateSprites', function() {

    it(
      'should create several sprites if the number of images exceeds the maximum number of images in the grid',
      function(done) {
        var expectedImagesPaths = ['image1', 'image2', 'image3', 'image4'];
        var expectedDestinationPath = '/destination/path';
        var expectedWidth = 142;
        var expectedHeight = 42;
        var expectedTotalColumns = 2;
        var expectedMaxRows = 1;
        var expectedQuality = 50;
        var expectedTemporaryDirectoryPath = '/tmp/path';

        imageProcessor.generateSprite = chai.spy(imageProcessor.generateSprite);

        imageProcessor.generateSprites(
          expectedImagesPaths,
          expectedDestinationPath,
          expectedWidth,
          expectedHeight,
          expectedTotalColumns,
          expectedMaxRows,
          expectedQuality,
          expectedTemporaryDirectoryPath,
          function(error, results) {
            assert.isNull(error, 'Unexpected error');

            imageProcessor.generateSprite.should.have.been.called.exactly(2);

            assert.lengthOf(results, expectedImagesPaths.length, 'Wrong number of images');

            assert.equal(results[0].sprite, expectedDestinationPath, 'Wrong sprite for image ' + results[0].image);
            assert.equal(results[0].image, expectedImagesPaths[0], 'Wrong image for image ' + results[0].image);
            assert.equal(results[0].x, 0, 'Wrong x coordinate for image ' + results[0].image);
            assert.equal(results[0].y, 0, 'Wrong y coordinate for image ' + results[0].image);

            assert.equal(results[1].sprite, expectedDestinationPath, 'Wrong sprite for image ' + results[1].image);
            assert.equal(results[1].image, expectedImagesPaths[1], 'Wrong image for image ' + results[1].image);
            assert.equal(results[1].x, expectedWidth, 'Wrong x coordinate for image ' + results[1].image);
            assert.equal(results[1].y, 0, 'Wrong y coordinate for image ' + results[1].image);

            assert.equal(
              results[2].sprite,
              expectedDestinationPath + '-1',
              'Wrong sprite for image ' + results[2].image
            );
            assert.equal(results[2].image, expectedImagesPaths[2], 'Wrong image for image ' + results[2].image);
            assert.equal(results[2].x, 0, 'Wrong x coordinate for image ' + results[2].image);
            assert.equal(results[2].y, 0, 'Wrong y coordinate for image ' + results[2].image);

            assert.equal(
              results[3].sprite,
              expectedDestinationPath + '-1',
              'Wrong sprite for image ' + results[3].image
            );
            assert.equal(results[3].image, expectedImagesPaths[3], 'Wrong image for image ' + results[3].image);
            assert.equal(results[3].x, expectedWidth, 'Wrong x coordinate for image ' + results[3].image);
            assert.equal(results[3].y, 0, 'Wrong y coordinate for image ' + results[3].image);

            done();
          }
        );
      }
    );

    it('should set default grid to 5x5', function(done) {
      var expectedImagesPaths = [];
      var expectedDestinationPath = '/destination/path';

      for (var i = 0; i < 25; i++) expectedImagesPaths.push('image' + i);

      imageProcessor.generateSprite = chai.spy(imageProcessor.generateSprite);

      imageProcessor.generateSprites(
        expectedImagesPaths,
        expectedDestinationPath,
        142,
        42,
        null,
        null,
        50,
        '/tmp/path',
        function(error, results) {
          assert.isNull(error, 'Unexpected error');
          imageProcessor.generateSprite.should.have.been.called.exactly(1);
          assert.lengthOf(results, expectedImagesPaths.length, 'Wrong number of images');
          done();
        }
      );
    });

    it('should set default temporary directory to the system temporary directory', function(done) {
      imageProcessor.generateSprite = chai.spy(function(imagesPaths, destinationPath, width, height, totalColumns,
        maxRows, quality, temporaryDirectoryPath, callback) {
        assert.match(temporaryDirectoryPath, new RegExp('^' + os.tmpdir()), 'Wrong temporary directory');
        callback(null, []);
      });

      imageProcessor.generateSprites(
        ['image1', 'image2'],
        '/destination/path',
        142,
        42,
        null,
        null,
        50,
        null,
        function(error, results) {
          assert.isNull(error, 'Unexpected error');
          imageProcessor.generateSprite.should.have.been.called.exactly(1);
          done();
        }
      );
    });

    it('should remove temporary directory when finished', function(done) {
      var expectedTemporaryDirectoryPath = '/tmp/path/';
      var temporaryDirectoryRemoved = false;

      fileSystem.rm = chai.spy(function(directoryPath, callback) {
        if (new RegExp('^' + expectedTemporaryDirectoryPath + '[^/]*$').test(directoryPath))
          temporaryDirectoryRemoved = true;

        callback();
      });

      imageProcessor.generateSprites(
        ['image1', 'image2'],
        '/destination/path',
        142,
        42,
        null,
        null,
        50,
        expectedTemporaryDirectoryPath,
        function(error, results) {
          assert.isNull(error, 'Unexpected error');
          fileSystem.rm.should.have.been.called.at.least(1);
          assert.ok(temporaryDirectoryRemoved, 'Expected temporary directory to be removed');
          done();
        }
      );
    });

    it('should execute callback with an error if generating sprite failed', function(done) {
      var expectedError = new Error('Something went wrong');

      imageProcessor.generateSprite = chai.spy(function(imagesPaths, destinationPath, width, height, totalColumns,
        maxRows, quality, temporaryDirectoryPath, callback) {
        callback(expectedError);
      });

      imageProcessor.generateSprites(
        ['image1', 'image2'],
        '/destination/path',
        142,
        42,
        null,
        null,
        50,
        null,
        function(error, results) {
          assert.strictEqual(error, expectedError, 'Wrong error');
          imageProcessor.generateSprite.should.have.been.called.exactly(1);
          done();
        }
      );
    });

    it('should execute callback with an error if removing temporary directory failed', function(done) {
      var expectedTemporaryDirectoryPath = '/tmp/path/';
      var expectedError = new Error('Something went wrong');

      fileSystem.rm = chai.spy(function(directoryPath, callback) {
        if (new RegExp('^' + expectedTemporaryDirectoryPath + '[^/]*$').test(directoryPath))
          return callback(expectedError);

        callback();
      });

      imageProcessor.generateSprites(
        ['image1', 'image2'],
        '/destination/path',
        142,
        42,
        null,
        null,
        50,
        expectedTemporaryDirectoryPath,
        function(error, results) {
          assert.strictEqual(error, expectedError, 'Wrong error');
          fileSystem.rm.should.have.been.called.at.least(1);
          done();
        }
      );
    });

  });

});
