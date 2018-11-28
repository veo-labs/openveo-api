'use strict';

module.exports = {

  // API unit tests
  api: {
    options: {
      reporter: 'spec'
    },
    src: [
      'tests/server/init.js',
      'tests/server/api/*.js',
      'tests/server/controllers/*.js',
      'tests/server/emitters/*.js',
      'tests/server/fileSystem/*.js',
      'tests/server/providers/*.js',
      'tests/server/socket/*.js',
      'tests/server/grunt/*.js',
      'tests/server/util/*.js',
      'tests/server/plugin/*.js',
      'tests/server/middlewares/*.js',
      'tests/server/storages/*.js',
      'tests/server/multipart/*.js',
      'tests/server/processor/*.js'
    ]
  }

};
