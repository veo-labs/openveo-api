'use strict';

var path = require('path');

// Set module root directory
process.rootApi = __dirname;
process.requireApi = function(filePath) {
  return require(path.join(process.rootApi, filePath));
};
