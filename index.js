'use strict';

var path = require('path');

// Set module root directory
process.rootApi = __dirname;
process.requireApi = function(filePath) {
  return require(path.join(process.rootApi, filePath));
};

module.exports.fileSystem = process.requireApi('lib/fileSystem.js');
module.exports.util = process.requireApi('lib/util.js');
module.exports.logger = process.requireApi('lib/logger.js');

module.exports.database = process.requireApi('lib/database/index.js');
module.exports.plugin = process.requireApi('lib/plugin/index.js');
module.exports.middlewares = process.requireApi('lib/middlewares/index.js');
module.exports.providers = process.requireApi('lib/providers/index.js');
module.exports.models = process.requireApi('lib/models/index.js');
module.exports.controllers = process.requireApi('lib/controllers/index.js');
module.exports.errors = process.requireApi('lib/errors/index.js');
module.exports.socket = process.requireApi('lib/socket/index.js');
module.exports.emitters = process.requireApi('lib/emitters/index.js');
module.exports.grunt = process.requireApi('lib/grunt/index.js');
module.exports.multipart = process.requireApi('lib/multipart/index.js');
