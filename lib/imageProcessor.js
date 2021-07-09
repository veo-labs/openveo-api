'use strict';

/**
 * Defines functions to manipulate images.
 *
 *     // Load module "imageProcessor"
 *     var fsApi = require('@openveo/api').imageProcessor;
 *
 * @module imageProcessor
 * @main imageProcessor
 * @class imageProcessor
 * @static
 */

var path = require('path');
var os = require('os');
var async = require('async');
var nanoid = require('nanoid').nanoid;
var gm = require('gm').subClass({
  imageMagick: true
});
var fileSystem = process.requireApi('lib/fileSystem.js');

/**
 * Generates a thumbnail from the given image.
 *
 * Destination directory is automatically created if it does not exist.
 *
 * @method generateThumbnail
 * @param {String} imagePath The image absolute path
 * @param {String} thumbnailPath The thumbnail path
 * @param {Number} [width] The expected image width (in px)
 * @param {Number} [height] The expected image height (in px)
 * @param {Boolean} [crop] Crop the image if the new ratio differs from original one
 * @param {Number} [quality] Expected quality from 0 to 100 (default to 90 with 100 the best)
 * @return {Function} callback Function to call when its done with:
 *   - **Error** An error if something went wrong
 */
module.exports.generateThumbnail = function(imagePath, thumbnailPath, width, height, crop, quality, callback) {
  var image = gm(imagePath);

  async.waterfall([

    // Create thumbnail directory if it does not exist
    function(callback) {
      fileSystem.mkdir(path.dirname(thumbnailPath), function(error) {
        callback(error);
      });
    },

    // Get original image size
    function(callback) {
      image.size(callback);
    },

    // Generate thumbnail
    function(size, callback) {
      var ratio = size.width / size.height;
      var cropPosition = {};
      var resizeWidth = width || Math.round(height * ratio);
      var resizeHeight = height || Math.round(width / ratio);

      if (crop && width && height) {
        if (ratio < width / height) {
          resizeHeight = Math.round(width / ratio);
          cropPosition = {x: 0, y: Math.round((resizeHeight - height) / 2)};
          crop = resizeHeight > height;
        } else {
          resizeWidth = Math.round(height * ratio);
          cropPosition = {x: Math.round((resizeWidth - width) / 2), y: 0};
          crop = resizeWidth > width;
        }
      }

      image
        .noProfile()
        .quality(quality)
        .resizeExact(resizeWidth, resizeHeight);

      if (crop)
        image.crop(width, height, cropPosition.x, cropPosition.y);

      image.write(thumbnailPath, callback);
    }

  ], function(error) {
    callback(error);
  });
};

/**
 * Creates an image from a list of images.
 *
 * Input images are aggregated horizontally or vertically to create the new image.
 *
 * @method aggregate
 * @param {Array} imagesPaths The list of paths of the images to add to the final image
 * @param {String} destinationPath The final image path
 * @param {Number} width The width of input images inside the image (in px)
 * @param {Number} height The height of input images inside the image (in px)
 * @param {Boolean} [horizontally=true] true to aggregate images horizontally, false to aggregate them vertically
 * @param {Number} [quality=90] Expected quality from 0 to 100 (default to 90 with 100 the best)
 * @param {String} [temporaryDirectoryPath] Path to the temporary directory to use to store intermediate images. It will
 * be removed at the end of the operation. If not specified a directory is created in /tmp/
 * @return {Function} callback Function to call when its done with:
 *   - **Error** An error if something went wrong
 *   - **Array** The list of images with:
 *     - **String** **sprite** The path of the sprite file containing the image (destinationPath)
 *     - **String** **image** The path of the original image
 *     - **Number** **x** The x coordinate of the image top left corner inside the sprite
 *     - **Number** **y** The y coordinate of the image top left corner inside the sprite
 */
module.exports.aggregate = function(imagesPaths, destinationPath, width, height, horizontally, quality,
  temporaryDirectoryPath, callback) {
  var self = this;
  var asyncFunctions = [];
  var thumbnailsPaths = [];
  var images = [];

  // Validate arguments
  quality = quality || 90;

  // Use a temporary directory to store thumbnails
  temporaryDirectoryPath = path.join(temporaryDirectoryPath || path.join(os.tmpdir()), nanoid());

  imagesPaths.forEach(function(imagePath) {
    asyncFunctions.push(function(callback) {
      var thumbnailPath = path.join(temporaryDirectoryPath, path.basename(imagePath));
      thumbnailsPaths.push({
        originalPath: imagePath,
        thumbnailPath: thumbnailPath
      });

      self.generateThumbnail(
        imagePath,
        thumbnailPath,
        width,
        height,
        true,
        100,
        callback
      );
    });
  });

  async.series([

    // Create destination path directory if it does not exist
    function(callback) {
      fileSystem.mkdir(path.dirname(destinationPath), function(error) {
        callback(error);
      });
    },

    // Generate thumbnails
    function(callback) {
      async.parallel(asyncFunctions, callback);
    },

    // Aggregate thumbnails
    function(callback) {
      var firstThumbnail;

      for (var i = 0; i < thumbnailsPaths.length; i++) {
        var thumbnailsPath = thumbnailsPaths[i].thumbnailPath;

        if (!firstThumbnail)
          firstThumbnail = gm(thumbnailsPath);
        else
          firstThumbnail.append(thumbnailsPath, horizontally);

        images.push({
          sprite: destinationPath,
          image: thumbnailsPaths[i].originalPath,
          x: horizontally ? width * i : 0,
          y: horizontally ? 0 : height * i
        });
      }
      firstThumbnail
        .quality(quality)
        .write(destinationPath, callback);
    }
  ], function(error, results) {
    fileSystem.rm(temporaryDirectoryPath, function(removeError) {
      if (error || removeError) return callback(error || removeError);

      callback(null, images);
    });
  });
};

/**
 * Generates a sprite from a list of images.
 *
 * If the number of images exceeds the maximum number of images (depending on totalColumns and maxRows), extra images
 * won't be in the sprite.
 *
 * @method generateSprite
 * @param {Array} imagesPaths The list of images path to include in the sprite
 * @param {String} destinationPath The sprite path
 * @param {Number} width The width of images inside the sprite (in px)
 * @param {Number} height The height of images inside the sprite (in px)
 * @param {Number} [totalColumns=5] The number of images per line in the sprite
 * @param {Number} [maxRows=5] The maximum number of lines of images in the sprite
 * @param {Number} [quality=90] Expected quality from 0 to 100 (default to 90 with 100 the best)
 * @param {String} [temporaryDirectoryPath] Path to the temporary directory to use to store intermediate images. It will
 * be removed at the end of the operation. If not specified a directory is created in /tmp/
 * @return {Function} callback Function to call when its done with:
 *   - **Error** An error if something went wrong
 *   - **Array** The list of images with:
 *     - **String** **sprite** The path of the sprite file containing the image (destinationPath)
 *     - **String** **image** The path of the original image
 *     - **Number** **x** The x coordinate of the image top left corner inside the sprite
 *     - **Number** **y** The y coordinate of the image top left corner inside the sprite
 */
module.exports.generateSprite = function(imagesPaths, destinationPath, width, height, totalColumns, maxRows, quality,
  temporaryDirectoryPath, callback) {
  var self = this;
  var linesPaths = [];
  var images = [];

  // Validate arguments
  totalColumns = totalColumns || 5;
  maxRows = maxRows || 5;
  quality = quality || 90;

  // Create a copy of the list of images to avoid modifying the original
  imagesPaths = imagesPaths.slice(0);

  // Use a temporary directory to store intermediate images
  temporaryDirectoryPath = path.join(temporaryDirectoryPath || path.join(os.tmpdir()), nanoid());

  // It is possible to have less than the expected number of columns if not enough images
  // The number of rows varies depending on the number of columns and the number of images
  var numberOfColumns = Math.min(imagesPaths.length, totalColumns);
  var numberOfRows = Math.ceil(imagesPaths.length / numberOfColumns);

  if (numberOfRows > maxRows) {

    // The number of images exceeds the possible number of images implicitly specified by the number of columns and rows
    // Ignore extra images
    numberOfRows = maxRows;
    imagesPaths = imagesPaths.slice(0, numberOfRows * numberOfColumns);

  }

  /**
   * Creates sprite lines by aggregating images.
   *
   * @param {Array} linesImagesPaths The list of images paths to aggregate
   * @param {String} linePath The path of the image to generate
   * @param {Number} lineWidth The line width (in px)
   * @param {Number} lineHeight The line height (in px)
   * @param {Boolean} horizontally true to create an horizontal line, false to create a vertical line
   * @param {Number} lineQuality The line quality from 0 to 100 (default to 90 with 100 the best)
   * @return {Function} The async function of the operation
   */
  var createLine = function(linesImagesPaths, linePath, lineWidth, lineHeight, horizontally, lineQuality) {
    return function(callback) {
      self.aggregate(
        linesImagesPaths,
        linePath,
        lineWidth,
        lineHeight,
        horizontally,
        lineQuality,
        temporaryDirectoryPath,
        callback
      );
    };
  };

  async.series([

    // Create destination path directory if it does not exist
    function(callback) {
      fileSystem.mkdir(path.dirname(destinationPath), function(error) {
        callback(error);
      });
    },

    // Create temporary directory if it does not exist
    function(callback) {
      fileSystem.mkdir(temporaryDirectoryPath, function(error) {
        callback(error);
      });
    },

    // Complete the grid defined by numberOfColumns and numberOfRows using transparent images if needed
    function(callback) {
      if (imagesPaths.length >= numberOfColumns * numberOfRows) return callback();

      var transparentImagePath = path.join(temporaryDirectoryPath, 'transparent.png');
      gm(width, height, '#00000000').write(transparentImagePath, function(error) {

        // Add as many as needed transparent images to the list of images
        var totalMissingImages = numberOfColumns * numberOfRows - imagesPaths.length;

        for (var i = 0; i < totalMissingImages; i++)
          imagesPaths.push(transparentImagePath);

        callback(error);
      });
    },

    // Create sprite horizontal lines
    function(callback) {
      var asyncFunctions = [];

      for (var i = 0; i < numberOfRows; i++) {
        var rowsImagesPaths = imagesPaths.slice(i * numberOfColumns, i * numberOfColumns + numberOfColumns);
        var lineWidth = width;
        var lineHeight = height;
        var linePath = path.join(temporaryDirectoryPath, 'line-' + i);

        linesPaths.push(linePath);
        asyncFunctions.push(createLine(rowsImagesPaths, linePath, lineWidth, lineHeight, true, 100));
      }

      async.parallel(asyncFunctions, function(error, results) {
        if (error) return callback(error);

        results.forEach(function(line) {
          line.forEach(function(image) {
            if (image.image === path.join(temporaryDirectoryPath, 'transparent.png')) return;

            var spritePathChunks = path.parse(image.sprite).name.match(/-([0-9]+)$/);
            var lineIndex = (spritePathChunks && parseInt(spritePathChunks[1])) || 0;

            image.y = image.y + (lineIndex * height);
            image.sprite = destinationPath;
            images.push(image);
          });
        });

        callback();
      });
    },

    // Aggregate lines vertically
    function(callback) {
      createLine(linesPaths, destinationPath, width * numberOfColumns, height, false, quality)(callback);
    }

  ], function(error, results) {
    fileSystem.rm(temporaryDirectoryPath, function(removeError) {
      if (error || removeError) return callback(error || removeError);

      callback(null, images);
    });
  });
};

/**
 * Generates sprites from a list of images.
 *
 * If the number of images don't fit in the grid defined by totalColumns * maxRows, then several sprites will be
 * created.
 * Additional sprites are suffixed by a number.
 *
 * @method generateSprites
 * @param {Array} imagesPaths The list of images paths to include in the sprites
 * @param {String} destinationPath The first sprite path, additional sprites are suffixed by a number
 * @param {Number} width The width of images inside the sprite (in px)
 * @param {Number} height The height of images inside the sprite (in px)
 * @param {Number} [totalColumns=5] The number of images per line in the sprite
 * @param {Number} [maxRows=5] The maximum number of lines of images in the sprite
 * @param {Number} [quality=90] Expected quality from 0 to 100 (default to 90 with 100 the best)
 * @param {String} [temporaryDirectoryPath] Path to the temporary directory to use to store intermediate images. It
 * will be removed at the end of the operation. If not specified a directory is created in /tmp/
 * @return {Function} callback Function to call when its done with:
 *   - **Error** An error if something went wrong
 *   - **Array** The list of images with:
 *     - **String** **sprite** The path of the sprite file containing the image
 *     - **String** **image** The path of the original image
 *     - **Number** **x** The x coordinate of the image top left corner inside the sprite
 *     - **Number** **y** The y coordinate of the image top left corner inside the sprite
 */
module.exports.generateSprites = function(imagesPaths, destinationPath, width, height, totalColumns, maxRows, quality,
  temporaryDirectoryPath, callback) {
  var self = this;
  var asyncFunctions = [];

  // Validate arguments
  totalColumns = totalColumns || 5;
  maxRows = maxRows || 5;
  temporaryDirectoryPath = path.join(temporaryDirectoryPath || path.join(os.tmpdir()), nanoid());

  // Find out how many sprites that have to be created
  var spriteMaxImages = totalColumns * maxRows;
  var totalSprites = Math.ceil(imagesPaths.length / spriteMaxImages);

  /**
   * Creates a sprite.
   *
   * @param {Array} spriteImagesPaths The list of images to include in the sprite
   * @param {String} spriteDestinationPath The sprite path
   * @return {Function} The async function of the operation
   */
  var createSprite = function(spriteImagesPaths, spriteDestinationPath) {
    return function(callback) {
      self.generateSprite(
        spriteImagesPaths,
        spriteDestinationPath,
        width,
        height,
        totalColumns,
        maxRows,
        quality,
        temporaryDirectoryPath,
        callback
      );
    };
  };

  for (var i = 0; i < totalSprites; i++) {
    var spriteImagesPaths = imagesPaths.slice(i * spriteMaxImages, i * spriteMaxImages + spriteMaxImages);
    var spriteDestinationPath = destinationPath;

    if (i > 0) {
      var destinationPathChunks = path.parse(destinationPath);
      destinationPathChunks.base = destinationPathChunks.name + '-' + i + destinationPathChunks.ext;
      spriteDestinationPath = path.format(destinationPathChunks);
    }

    asyncFunctions.push(createSprite(spriteImagesPaths, spriteDestinationPath));
  }

  async.parallel(asyncFunctions, function(error, results) {
    fileSystem.rm(temporaryDirectoryPath, function(removeError) {
      if (error || removeError) return callback(error || removeError);

      var images = [];
      results.forEach(function(sprite) {
        images = images.concat(sprite);
      });

      callback(null, images);
    });
  });
};
