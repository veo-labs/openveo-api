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
          i18nDirectory: path.normalize(path.join(__dirname, '/i18n'))
        }
      ]
      );
    i18n = process.requireAPI('lib/i18n.js');
  });

  // getTranslations method
  describe('getTranslations', function() {

    it('Should return a JSON object', function(done) {
      i18n.getTranslations('languages', 'fr', function(translations) {
        assert.isDefined(translations);
        assert.isObject(translations);
        assert.equal(translations.ENGLISH, 'anglais');
        done();
      });
    });

    it('Should return null if no translation found', function(done) {
      i18n.getTranslations('no-translation', 'fr', function(translations) {
        assert.isNull(translations);
        done();
      });
    });

    it('Should return null if dictionary is not specified', function(done) {
      i18n.getTranslations(null, 'fr', function(translations) {
        assert.isNull(translations);
        done();
      });
    });

    it('Should be able to get translation of a particular language', function(done) {
      i18n.getTranslations('login', 'en', function(translations) {
        assert.equal(translations.LOGIN.LOGIN, 'User');
        done();
      });
    });

    it('Should be able to get a translation by language and country code', function(done) {
      i18n.getTranslations('canadian', 'en-CA', function(translations) {
        assert.equal(translations.DOLLAR, 'Loonie');
        done();
      });
    });

    it('Should be able to get both plugin translations and openveo translations (merged)', function(done) {
      i18n.getTranslations('admin-back-office', 'en', function(translations) {
        assert.equal(translations.MENU.DASHBOARD, 'Dashboard');
        assert.equal(translations.MENU.EXAMPLE, 'Example');
        done();
      });
    });

  });

});
