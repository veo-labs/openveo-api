'use strict';

var util = require('util');
var path = require('path');
var assert = require('chai').assert;
var pluginManager = process.requireApi('lib/plugin/pluginManager.js');
var Plugin = process.requireApi('lib/plugin/Plugin.js');
var i18n = process.requireApi('lib/i18n.js');

// i18n.js
describe('i18n', function() {
  var TestPlugin;

  // Mocks
  beforeEach(function() {
    TestPlugin = function() {
      TestPlugin.super_.call(this);
    };

    util.inherits(TestPlugin, Plugin);
  });

  // Add core plugin
  beforeEach(function() {
    var examplePlugin = new TestPlugin();
    examplePlugin.name = 'example';
    examplePlugin.i18nDirectory = path.join(__dirname, 'resources', 'example');

    var example2Plugin = new TestPlugin();
    example2Plugin.name = 'example2';
    example2Plugin.i18nDirectory = path.join(__dirname, 'resources', 'example2');

    pluginManager.addPlugin(examplePlugin);
    pluginManager.addPlugin(example2Plugin);
  });

  // Remove core plugin
  afterEach(function() {
    pluginManager.removePlugin('example');
    pluginManager.removePlugin('example2');
  });

  // getTranslations method
  describe('getTranslations', function() {

    it('should be able to get translation of a particular language', function(done) {
      i18n.getTranslations('french', 'fr', function(error, translations) {
        assert.isNull(error, 'Getting translations failed : ' + (error && error.message));
        assert.equal(translations.EXAMPLE.FRENCH, 'Français');
        done();
      });
    });

    it('should be able to get a translation of a particular language and country', function(done) {
      i18n.getTranslations('canadian', 'en-CA', function(error, translations) {
        assert.equal(translations.EXAMPLE.DOLLAR, 'Loonie');
        done();
      });
    });

    it('should not wrap translations if already wrapped', function(done) {
      i18n.getTranslations('wrapped', 'en', function(error, translations) {
        assert.equal(translations.EXAMPLE.WRAPPED, 'wrapped');
        done();
      });
    });

    it('should return null if no translation found', function(done) {
      i18n.getTranslations('no-translation', 'fr', function(error, translations) {
        assert.isNull(translations);
        done();
      });
    });

    it('should return null if dictionary is not specified', function(done) {
      i18n.getTranslations(null, 'fr', function(error, translations) {
        assert.isNull(translations);
        done();
      });
    });

    it('should return translations in english if no language is not specified', function(done) {
      i18n.getTranslations('english', null, function(error, translations) {
        assert.equal(translations.EXAMPLE.ENGLISH, 'English');
        done();
      });
    });

    it('should be able to get translations for all plugins (merged)', function(done) {
      i18n.getTranslations('common', 'en', function(error, translations) {
        assert.equal(translations.EXAMPLE.COMMON, 'Common');
        assert.equal(translations.EXAMPLE2.COMMON, 'Common');
        done();
      });
    });

  });

});
