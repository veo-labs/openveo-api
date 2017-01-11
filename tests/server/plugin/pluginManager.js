'use strict';

var util = require('util');
var assert = require('chai').assert;
var pluginManager = process.requireApi('lib/plugin/pluginManager.js');
var Plugin = process.requireApi('lib/plugin/Plugin.js');

// pluginManager.js
describe('pluginManager', function() {
  var TestPlugin;

  // Mocks
  beforeEach(function() {
    TestPlugin = function() {
      TestPlugin.super_.call(this);
      this.name = 'test';
    };

    util.inherits(TestPlugin, Plugin);
  });

  // Remove all plugins
  afterEach(function() {
    var plugins = pluginManager.getPlugins();

    plugins.forEach(function(plugin) {
      pluginManager.removePlugin(plugin.name);
    });
  });

  // addPlugin method
  describe('addPlugin', function() {

    it('should be able to add a new plugin', function() {
      var testPlugin = new TestPlugin();
      pluginManager.addPlugin(testPlugin);
      assert.equal(pluginManager.getPlugins().length, 1);
    });

    it('should not be able to add a plugin without a name', function() {
      assert.throws(function() {
        pluginManager.addPlugin({});
      }, TypeError);
    });

    it('should not be able to add a plugin which is not an instance of Plugin', function() {
      var fakePlugin = {name: 'test'};
      assert.throws(function() {
        pluginManager.addPlugin(fakePlugin);
      }, Error);
    });

    it('should not be able to modify a plugin when added', function() {
      var testPlugin = new TestPlugin();
      pluginManager.addPlugin(testPlugin);

      assert.throws(function() {
        testPlugin.name = 'another name';
      }, TypeError);
    });

  });

  // getPlugin method
  describe('getPlugin', function() {
    var testPlugin;

    beforeEach(function() {
      testPlugin = new TestPlugin();
      pluginManager.addPlugin(testPlugin);
    });

    it('should be able to get a plugin by its name', function() {
      assert.strictEqual(testPlugin, pluginManager.getPlugin(testPlugin.name));
    });

    it('should return null if plugin does not exist', function() {
      assert.isNull(pluginManager.getPlugin('wrong name'));
    });

    it('should return null if no name is provided', function() {
      assert.isNull(pluginManager.getPlugin());
    });

  });

  // getPlugins method
  describe('getPlugins', function() {

    it('should return the list of plugins', function() {
      var testPlugin = new TestPlugin();
      pluginManager.addPlugin(testPlugin);

      assert.equal(pluginManager.getPlugins().length, 1);
    });

  });

  // removePlugin method
  describe('removePlugin', function() {

    it('should be able to remove a plugin from the list of plugins', function() {
      var testPlugin = new TestPlugin();
      pluginManager.addPlugin(testPlugin);

      pluginManager.removePlugin(testPlugin.name);
      assert.equal(pluginManager.getPlugins().length, 0);
    });

    it('should not do anything if name does not correspond to a plugin', function() {
      var testPlugin = new TestPlugin();
      pluginManager.addPlugin(testPlugin);

      pluginManager.removePlugin('unknown');
      assert.equal(pluginManager.getPlugins().length, 1);
    });

  });


});
