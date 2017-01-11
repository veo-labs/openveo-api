'use strict';

var util = require('util');
var assert = require('chai').assert;
var ContentController = process.requireApi('lib/controllers/ContentController.js');
var ContentModel = process.requireApi('lib/models/ContentModel.js');
var EntityProvider = process.requireApi('lib/providers/EntityProvider.js');
var Database = process.requireApi('lib/database/Database.js');
var Plugin = process.requireApi('lib/plugin/Plugin.js');
var pluginManager = process.requireApi('lib/plugin/pluginManager.js');

// ContentController.js
describe('ContentController', function() {
  var CorePlugin;
  var TestContentModel;
  var TestEntityProvider;
  var TestContentController;
  var testContentController;

  // Mocks
  beforeEach(function() {
    CorePlugin = function() {
      CorePlugin.super_.call(this);
      this.name = 'core';
      this.api = {
        getDatabase: function() {
          return new Database({});
        }
      };
    };

    TestContentModel = function(user, provider) {
      TestContentModel.super_.call(this, user, provider);
    };

    TestEntityProvider = function(database) {
      TestEntityProvider.super_.call(this, database, 'test_collection');
    };

    TestContentController = function(ModelConstructor, ProviderConstructor) {
      TestContentController.super_.call(this, ModelConstructor, ProviderConstructor);
    };

    util.inherits(CorePlugin, Plugin);
    util.inherits(TestContentModel, ContentModel);
    util.inherits(TestEntityProvider, EntityProvider);
    util.inherits(TestContentController, ContentController);
  });

  // Add core plugin
  beforeEach(function() {
    pluginManager.addPlugin(new CorePlugin());
  });

  // Remove core plugin
  afterEach(function() {
    pluginManager.removePlugin('core');
  });

  // Prepare tests using mocks
  beforeEach(function() {
    testContentController = new TestContentController(TestContentModel, TestEntityProvider);
  });

  // getModel method
  describe('getModel', function() {

    it('should instantiate the ContentModel with the connected user and a provider', function() {
      var user = {id: 42, permissions: [], groups: []};
      var model = testContentController.getModel({
        user: user
      });

      assert.strictEqual(model.user, user, 'Expected a user for a ContentModel');
      assert.ok(model.provider instanceof TestEntityProvider, 'Unexpected provider');
    });

  });

});
