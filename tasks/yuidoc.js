'use strict';

module.exports = {

  // API doc
  api: {
    name: 'OpenVeo server API for plugins',
    description: 'OpenVeo server side API for plugins',
    version: '<%= pkg.version %>',
    options: {
      paths: 'lib',
      outdir: './site/<%= pkg.version %>',
      linkNatives: true,
      themedir: 'node_modules/yuidoc-theme-blue'
    }
  }

};
