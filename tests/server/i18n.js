'use strict';

var path = require('path');
var assert = require('chai').assert;
var applicationStorage = process.requireAPI('lib/applicationStorage.js');

// i18n.js
describe('i18n', function() {
  var i18n;

  before(function() {
    applicationStorage.setPlugins(
      [
        {
          name: 'example',
          i18nDirectory: path.join(__dirname, 'i18n', 'example')
        },
        {
          name: 'example2',
          i18nDirectory: path.join(__dirname, 'i18n', 'example2')
        }
      ]
      );
    i18n = process.requireAPI('lib/i18n.js');
  });

  // getTranslations method
  describe('getTranslations', function() {

    it('should be able to get translation of a particular language', function(done) {
      i18n.getTranslations('french', 'fr', function(error, translations) {
        assert.isUndefined(error, 'Getting translations failed : ' + (error && error.message));
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
