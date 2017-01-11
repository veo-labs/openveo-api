'use strict';

var util = require('util');
var assert = require('chai').assert;
var openVeoApi = process.requireApi('index.js');
var pluginManager = process.requireApi('lib/plugin/pluginManager.js');
var Plugin = process.requireApi('lib/plugin/Plugin.js');

// api.js
describe('api', function() {
  var CorePlugin;
  var TestPlugin;

  // Mocks
  beforeEach(function() {
    CorePlugin = function() {
      CorePlugin.super_.call(this);
      this.name = 'core';
      this.api = {};
    };

    TestPlugin = function() {
      TestPlugin.super_.call(this);
      this.name = 'test';
      this.api = {};
    };

    util.inherits(CorePlugin, Plugin);
    util.inherits(TestPlugin, Plugin);
  });

  // Remove all plugins
  afterEach(function() {
    var plugins = pluginManager.getPlugins();

    plugins.forEach(function(plugin) {
      pluginManager.removePlugin(plugin.name);
    });
  });

  // getApi method
  describe('getApi', function() {

    it('should return the plugin\'s API', function() {
      var testPlugin = new TestPlugin();
      pluginManager.addPlugin(testPlugin);
      assert.strictEqual(openVeoApi.api.getApi('test'), testPlugin.api);
    });

    it('should return null if no name is provided', function() {
      assert.isNull(openVeoApi.api.getApi());
    });

  });

  // getCoreApi method
  describe('getCoreApi', function() {

    it('should return the core\'s API', function() {
      pluginManager.addPlugin(new CorePlugin());
      assert.strictEqual(openVeoApi.api.getCoreApi(), pluginManager.getPlugin('core').api);
    });

  });

});
