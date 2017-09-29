'use strict';

var chai = require('chai');
var spies = require('chai-spies');
var PluginApi = process.requireApi('lib/plugin/PluginApi.js');
var assert = chai.assert;

chai.should();
chai.use(spies);

// PluginApi.js
describe('PluginApi', function() {
  var api;

  // Prepare tests
  beforeEach(function() {
    api = new PluginApi();
  });

  // registerAction method
  describe('registerAction', function() {

    it('should be able to register an action on a hook', function() {
      var hook = 'hook';
      var expectedData = {};
      var action = chai.spy(function(data, callback) {
        assert.strictEqual(data, expectedData, 'Unexpected data');
        callback();
      });
      api.registerAction(hook, action);

      api.executeHook(hook, expectedData, function() {
        action.should.have.been.called.exactly(1);
      });
    });

    it('should throw an error if hook is not a string', function() {
      var invalidValues = [undefined, null, 42, {}, function() {}];
      var action = function() {};

      invalidValues.forEach(function(invalidValue) {
        assert.throws(function() {
          api.registerAction(invalidValue, action);
        }, Error, null, 'Expected exception when parameter hook is ' + typeof invalidValue);
      });
    });

    it('should throw an error if hook is not a function', function() {
      var invalidValues = [undefined, null, 42, {}, 'string'];

      invalidValues.forEach(function(invalidValue) {
        assert.throws(function() {
          api.registerAction('hook', invalidValue);
        }, Error, null, 'Expected exception when parameter action is ' + typeof invalidValue);
      });
    });

  });

  // unregisterAction method
  describe('unregisterAction', function() {

    it('should be able to unregister an action from a hook', function() {
      var hook = 'hook';
      var action = function() {};

      api.registerAction(hook, action);
      assert.equal(api.actions[hook].length, 1);

      api.unregisterAction(hook, action);
      assert.equal(api.actions[hook].length, 0);
    });

    it('should not do anything if action is not registered', function() {
      var hook = 'hook';
      api.unregisterAction(hook, function() {});
      assert.isUndefined(api.actions[hook], 0);
    });

  });

  // executeHook method
  describe('executeHook', function() {

    it('should execute all actions registered on a hook', function() {
      var hook = 'hook';
      var expectedData = {};
      var action1 = chai.spy(function(data, callback) {
        assert.strictEqual(data, expectedData, 'Unexpected data on action 1');
        callback();
      });
      var action2 = chai.spy(function(data, callback) {
        assert.strictEqual(data, expectedData, 'Unexpected data on action 2');
        callback();
      });

      api.registerAction(hook, action1);
      api.registerAction(hook, action2);

      api.executeHook(hook, expectedData, function() {
        action1.should.have.been.called.exactly(1);
        action2.should.have.been.called.exactly(1);
      });
    });

    it('should execute the callback function with an error if an action is on error', function() {
      var hook = 'hook';
      var expectedError = new Error('Error in a hook action');
      var action1 = function(data, callback) {
        callback(expectedError);
      };
      var action2 = function(data, callback) {
        assert.ok(false, 'Unexpected action');
        callback();
      };

      api.registerAction(hook, action1);
      api.registerAction(hook, action2);

      api.executeHook(hook, null, function(error) {
        assert.strictEqual(error, expectedError, 'Expected an error');
      });
    });

    it('should not do anything if hook is not a string', function() {
      var hook = 'hook';
      var invalidValues = [undefined, null, 42, {}, function() {}];
      var action = chai.spy(function(data, callback) {
        callback();
      });
      api.registerAction(hook, action);

      invalidValues.forEach(function(invalidValue) {
        api.executeHook(invalidValue, null, function() {
          action.should.have.been.called.exactly(0);
        });
      });
    });

    it('should not do anything if no action is registered for the hook', function() {
      var expectedHook = 'hook';
      var action = chai.spy(function(data, callback) {
        callback();
      });
      api.registerAction('another-hook', action);

      api.executeHook(expectedHook, null, function() {
        action.should.have.been.called.exactly(0);
      });
    });

  });

});
