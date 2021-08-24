'use strict';

var fs = require('fs');
var path = require('path');
var assert = require('chai').assert;
var ngDpTask = process.requireApi('lib/grunt/ngDpTask/ngDpTask.js');
var utilApi = process.requireApi('lib/util.js');

describe('ngDpTask', function() {
  var grunt;
  var ngDpTaskFunction;
  var resourcesDirPath = path.join(__dirname, 'ngDpTask/resources');
  var destinationFile = path.join(resourcesDirPath, 'resources.json');

  function launchTask(filesToAdd, validate, options) {
    ngDpTaskFunction.call({
      files: [
        {
          src: filesToAdd,
          dest: destinationFile
        }
      ],
      async: function() {
        return function() {
          validate();
        };
      },
      options: function(opts) {
        return utilApi.merge(opts, options);
      }
    });
  }

  // Mock
  beforeEach(function() {
    grunt = {
      fail: {
        fatal: function(error) {
          throw error;
        }
      },
      verbose: {
        writeln: function() {}
      },
      file: {
        write: function(filePath, data) {
          // eslint-disable-next-line node/no-sync
          fs.writeFileSync(filePath, data);
        }
      },
      log: {
        oklns: function() {}
      }
    };
  });

  // Prepare tests
  beforeEach(function() {
    ngDpTaskFunction = ngDpTask(grunt);
  });

  // Remove generated file after each test
  afterEach(function(done) {
    fs.unlink(destinationFile, function(error) {
      delete require.cache[destinationFile];
      done();
    });
  });

  it('should be able to order modules using module dependencies', function(done) {
    var filesToAdd = [
      path.join(resourcesDirPath, 'modulesDependencies/module2/module2.module.js'),
      path.join(resourcesDirPath, 'modulesDependencies/module1/module1.module.js'),
      path.join(resourcesDirPath, 'modulesDependencies/module1/module1.css'),
      path.join(resourcesDirPath, 'modulesDependencies/module2/module2.css')
    ];

    function validate() {
      var resources = require(destinationFile);
      assert.equal(resources.js[0], filesToAdd[1], 'Expected module1 JS to be loaded before module2');
      assert.equal(resources.js[1], filesToAdd[0], 'Expected module2 JS to be loaded after module1');
      assert.equal(resources.css[0], filesToAdd[2], 'Expected module1 CSS to be loaded before module2');
      assert.equal(resources.css[1], filesToAdd[3], 'Expected module2 CSS to be loaded after module1');
      done();
    }

    launchTask(filesToAdd, validate);
  });

  it('should be able to order modules before files of the different modules', function(done) {
    var filesToAdd = [
      path.join(resourcesDirPath, 'modulesWithFiles/module2/module2.module.js'),
      path.join(resourcesDirPath, 'modulesWithFiles/module1/module1.module.js'),
      path.join(resourcesDirPath, 'modulesWithFiles/module1/module1.factory.js'),
      path.join(resourcesDirPath, 'modulesWithFiles/module2/module2.factory.js')
    ];

    function validate() {
      var resources = require(destinationFile);
      assert.equal(resources.js[0], filesToAdd[1], 'Expected module1 JS to be loaded before module2');
      assert.equal(resources.js[1], filesToAdd[0], 'Expected module2 JS to be loaded after module1');
      assert.equal(resources.js.length, filesToAdd.length, 'Wrong number of JavaScript files');
      assert.includeMembers(resources.js, [filesToAdd[2], filesToAdd[3]], 'Wrong JavaScript files');
      done();
    }

    launchTask(filesToAdd, validate);
  });

  it('should be able to order a factory and its associated dependencies', function(done) {
    var filesToAdd = [
      path.join(resourcesDirPath, 'factory/factory2.factory.js'),
      path.join(resourcesDirPath, 'factory/factory1.factory.js')
    ];

    function validate() {
      var resources = require(destinationFile);
      assert.equal(resources.js[0], filesToAdd[1], 'Expected factory1 JS to be loaded before factory2');
      assert.equal(resources.js[1], filesToAdd[0], 'Expected factory2 JS to be loaded after factory1');
      done();
    }

    launchTask(filesToAdd, validate);
  });

  it('should be able to order a component and its associated dependencies', function(done) {
    var filesToAdd = [
      path.join(resourcesDirPath, 'component/component.component.js'),
      path.join(resourcesDirPath, 'component/component.controller.js')
    ];

    function validate() {
      var resources = require(destinationFile);
      assert.equal(resources.js[0], filesToAdd[1], 'Expected controller JS to be loaded before component');
      assert.equal(resources.js[1], filesToAdd[0], 'Expected component JS to be loaded after controller');
      done();
    }

    launchTask(filesToAdd, validate);
  });

  it('should be able to order a controller and its associated dependencies', function(done) {
    var filesToAdd = [
      path.join(resourcesDirPath, 'controller/controller.controller.js'),
      path.join(resourcesDirPath, 'controller/controller.factory.js')
    ];

    function validate() {
      var resources = require(destinationFile);
      assert.equal(resources.js[0], filesToAdd[1], 'Expected factory JS to be loaded before controller');
      assert.equal(resources.js[1], filesToAdd[0], 'Expected controller JS to be loaded after factory');
      done();
    }

    launchTask(filesToAdd, validate);
  });

  it('should be able to order a directive and its associated dependencies', function(done) {
    var filesToAdd = [
      path.join(resourcesDirPath, 'directive/directive.directive.js'),
      path.join(resourcesDirPath, 'directive/directive.controller.js')
    ];

    function validate() {
      var resources = require(destinationFile);
      assert.equal(resources.js[0], filesToAdd[1], 'Expected controller JS to be loaded before directive');
      assert.equal(resources.js[1], filesToAdd[0], 'Expected directive JS to be loaded after controller');
      done();
    }

    launchTask(filesToAdd, validate);
  });

  it('should be able to order an AngularJS element which contains a filter', function(done) {
    var filesToAdd = [
      path.join(resourcesDirPath, 'filter/filter.factory.js'),
      path.join(resourcesDirPath, 'filter/filter.filter.js')
    ];

    function validate() {
      var resources = require(destinationFile);
      assert.equal(resources.js[0], filesToAdd[1], 'Expected filter JS to be loaded before factory');
      assert.equal(resources.js[1], filesToAdd[0], 'Expected factory JS to be loaded after filter');
      done();
    }

    launchTask(filesToAdd, validate);
  });

  it('should be able to order a file containing an AngularJS config', function(done) {
    var filesToAdd = [
      path.join(resourcesDirPath, 'config/config.js'),
      path.join(resourcesDirPath, 'config/config.factory.js')
    ];

    function validate() {
      var resources = require(destinationFile);
      assert.equal(resources.js[0], filesToAdd[1], 'Expected factory JS to be loaded before config');
      assert.equal(resources.js[1], filesToAdd[0], 'Expected config JS to be loaded after factory');
      done();
    }

    launchTask(filesToAdd, validate);
  });

  it('should be able to handle circular dependencies', function(done) {
    var filesToAdd = [
      path.join(resourcesDirPath, 'circularDependencies/circularDependencies.js'),
      path.join(resourcesDirPath, 'circularDependencies/circularDependencies.factory.js')
    ];

    function validate() {
      var resources = require(destinationFile);
      assert.equal(resources.js.length, filesToAdd.length, 'Wrong number of JS files');
      assert.equal(resources.js[0], filesToAdd[1], 'Expected factory JS to be loaded before module');
      assert.equal(resources.js[1], filesToAdd[0], 'Expected module JS to be loaded after factory');
      done();
    }

    launchTask(filesToAdd, validate);
  });

  it('should be able to order a file containing AngularJS route definitions', function(done) {
    var filesToAdd = [
      path.join(resourcesDirPath, 'routes/routes.js'),
      path.join(resourcesDirPath, 'routes/routes.controller.js'),
      path.join(resourcesDirPath, 'routes/routes.factory.js')
    ];

    function validate() {
      var resources = require(destinationFile);
      assert.equal(
        resources.js[resources.js.length - 1],
        filesToAdd[0],
        'Expected routes JS to be loaded after others'
      );
      done();
    }

    launchTask(filesToAdd, validate);
  });

  it('should be able to replace base path by a prefix', function(done) {
    var cssPrefix = '/new/css/prefix';
    var jsPrefix = '/new/js/prefix';
    var filesToAdd = [
      path.join(resourcesDirPath, 'component/component.component.js'),
      path.join(resourcesDirPath, 'component/component.controller.js'),
      path.join(resourcesDirPath, 'component/component.module.js'),
      path.join(resourcesDirPath, 'component/component.css')
    ];

    function validate() {
      var resources = require(destinationFile);
      assert.equal(resources.css[0], filesToAdd[3].replace(resourcesDirPath, cssPrefix), 'Wrong css prefix');
      assert.equal(resources.js[0], filesToAdd[2].replace(resourcesDirPath, jsPrefix), 'Wrong js prefix');
      assert.equal(resources.js[1], filesToAdd[1].replace(resourcesDirPath, jsPrefix), 'Wrong js prefix');
      assert.equal(resources.js[2], filesToAdd[0].replace(resourcesDirPath, jsPrefix), 'Wrong js prefix');
      done();
    }

    launchTask(filesToAdd, validate, {
      basePath: resourcesDirPath,
      cssPrefix: cssPrefix,
      jsPrefix: jsPrefix
    });

  });

});
