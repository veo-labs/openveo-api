'use strict';

// Module dependencies
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
          i18nDirectory: path.normalize(path.join(__dirname, 'i18n', 'example'))
        },
        {
          name: 'example2',
          i18nDirectory: path.normalize(path.join(__dirname, 'i18n', 'example2'))
        }
      ]
      );
    i18n = process.requireAPI('lib/i18n.js');
  });

  // getTranslations method
  describe('getTranslations', function() {

    it('Should return a JSON object', function(done) {
      i18n.getTranslations('languages', 'fr', function(error, translations) {
        assert.isDefined(translations);
        assert.isObject(translations);
        assert.equal(translations.EXAMPLE.ENGLISH, 'anglais');
        done();
      });
    });

    it('Should return null if no translation found', function(done) {
      i18n.getTranslations('no-translation', 'fr', function(error, translations) {
        assert.isNull(translations);
        done();
      });
    });

    it('Should return null if dictionary is not specified', function(done) {
      i18n.getTranslations(null, 'fr', function(error, translations) {
        assert.isNull(translations);
        done();
      });
    });

    it('Should be able to get translation of a particular language', function(done) {
      i18n.getTranslations('french', 'fr', function(error, translations) {
        assert.equal(translations.EXAMPLE.FRENCH, 'Français');
        done();
      });
    });

    it('Should be able to get a translation by language and country code', function(done) {
      i18n.getTranslations('canadian', 'en-CA', function(error, translations) {
        assert.equal(translations.EXAMPLE.DOLLAR, 'Loonie');
        done();
      });
    });

    it('Should be able to get plugins translations (merged)', function(done) {
      i18n.getTranslations('admin-back-office', 'en', function(error, translations) {
        assert.equal(translations.EXAMPLE.MENU.EXAMPLE, 'Example');
        assert.equal(translations.EXAMPLE2.MENU.EXAMPLE2, 'Example2');
        done();
      });
    });

  });

});
