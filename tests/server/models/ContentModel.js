'use strict';

var util = require('util');
var assert = require('chai').assert;
var ContentModel = process.requireApi('lib/models/ContentModel.js');
var EntityProvider = process.requireApi('lib/providers/EntityProvider.js');
var Database = process.requireApi('lib/database/Database.js');
var AccessError = process.requireApi('lib/errors/AccessError.js');

// ContentModel.js
describe('ContentModel', function() {
  var database;
  var ADMIN_ID = '0';
  var ANONYMOUS_ID = '1';
  var provider;
  var TestEntityProvider;
  var TestContentModel;

  // Mocks
  beforeEach(function() {
    TestContentModel = function(user, provider) {
      TestContentModel.super_.call(this, user, provider);
    };

    TestContentModel.prototype.getSuperAdminId = function() {
      return ADMIN_ID;
    };

    TestContentModel.prototype.getAnonymousId = function() {
      return ANONYMOUS_ID;
    };

    TestEntityProvider = function(database, collection) {
      TestEntityProvider.super_.call(this, database, collection);
    };

    util.inherits(TestContentModel, ContentModel);
    util.inherits(TestEntityProvider, EntityProvider);
  });

  // Prepare tests
  beforeEach(function() {
    database = new Database({});
    provider = new TestEntityProvider(database, 'my_collection');
  });

  it('should expose user associated groups', function() {
    var groupName = 'mygroup';
    var user = {
      id: '42',
      permissions: [
        'get-group-' + groupName,
        'update-group-' + groupName,
        'wrongoperation-group-' + groupName
      ]
    };
    var model = new TestContentModel(user, provider);

    assert.sameMembers(['get', 'update'], model.groups[groupName]);
  });

  // isUserAdmin method
  describe('isUserAdmin', function() {

    it('should be able to indicate if the associated user is the administrator', function() {
      var user = {id: ADMIN_ID};
      var model = new TestContentModel(user, provider);
      assert.ok(model.isUserAdmin(user), 'Expected user to be the administrator');

      user.id = '42';
      assert.notOk(model.isUserAdmin(user), 'Expected user not to be the administrator');

      user = null;
      assert.notOk(model.isUserAdmin(user), 'Expected null not to be the administrator');
    });

  });

  // isUserAuthorized method
  describe('isUserAuthorized', function() {

    it('should authorize the administrator to perform any kind of operation on all entities', function() {
      var entity;
      var user = {id: ADMIN_ID};
      var model = new TestContentModel(user, provider);

      entity = {metadata: {user: ANONYMOUS_ID}};
      assert.ok(model.isUserAuthorized(entity, 'get'), 'Expected admin to perform a get on an anonymous entity');
      assert.ok(model.isUserAuthorized(entity, 'update'), 'Expected admin to perform an update on an anonymous entity');
      assert.ok(model.isUserAuthorized(entity, 'delete'), 'Expected admin to perform a delete on an anonymous entity');

      entity = {metadata: {user: '42', groups: ['mygroup']}};
      assert.ok(model.isUserAuthorized(entity, 'get'), 'Expected admin to perform a get on someone\'s entity');
      assert.ok(model.isUserAuthorized(entity, 'update'), 'Expected admin to perform an update on someone\'s entity');
      assert.ok(model.isUserAuthorized(entity, 'delete'), 'Expected admin to perform a delete on someone\'s entity');
    });

    it('should authorize anyone to perform any kind of operation on anonymous entities', function() {
      var entity;
      var user = {id: '42'};
      var model = new TestContentModel(user, provider);

      entity = {metadata: {user: ANONYMOUS_ID}};
      assert.ok(model.isUserAuthorized(entity, 'get'), 'Expected anyone to perform a get on an anonymous entity');
      assert.ok(model.isUserAuthorized(entity, 'update'),
                'Expected anyone to perform an update on an anonymous entity');
      assert.ok(model.isUserAuthorized(entity, 'delete'),
                'Expected anyone to perform a delete on an anonymous entity');
    });

    it('should authorize user with the right permission to perform operation on the entity', function() {
      var groupName = 'mygroup';
      var entity;
      var user = {
        id: '42',
        permissions: [
          'get-group-' + groupName,
          'update-group-' + groupName,
          'delete-group-' + groupName
        ]
      };
      var model = new TestContentModel(user, provider);

      entity = {metadata: {user: '43', groups: ['mygroup']}};
      assert.ok(model.isUserAuthorized(entity, 'get'), 'Expected user to perform a get on an entity of his group');
      assert.ok(model.isUserAuthorized(entity, 'update'),
                'Expected anyone to perform an update on an entity of his group');
      assert.ok(model.isUserAuthorized(entity, 'delete'),
                'Expected anyone to perform a delete on an entity of his group');
    });

    it('should not authorize a user to perform operation on the entity of another user', function() {
      var entity;
      var user = {id: '42'};
      var model = new TestContentModel(user, provider);

      entity = {metadata: {user: '43'}};
      assert.notOk(model.isUserAuthorized(entity, 'get'), 'Unexpected user to perform a get on someone else entity');
      assert.notOk(model.isUserAuthorized(entity, 'update'),
                   'Expected user to perform an update on someone else entity');
      assert.notOk(model.isUserAuthorized(entity, 'delete'),
                   'Expected user to perform a delete on someone else entity');
    });

    it('should not authorize a user to perform operation on the entity of his group without permission', function() {
      var model;
      var groupName = 'mygroup';
      var entity = {metadata: {user: '43', groups: ['mygroup']}};
      var user = {
        id: '42',
        permissions: [
          'update-group-' + groupName,
          'delete-group-' + groupName
        ]
      };

      model = new TestContentModel(user, provider);
      assert.notOk(model.isUserAuthorized(entity, 'get'), 'Unexpected user to perform a get without permission');

      user.permissions = [
        'get-group-' + groupName,
        'delete-group-' + groupName
      ];
      model = new TestContentModel(user, provider);
      assert.notOk(model.isUserAuthorized(entity, 'update'), 'Unexpected user to perform an update without permission');

      user.permissions = [
        'get-group-' + groupName,
        'update-group-' + groupName
      ];
      model = new TestContentModel(user, provider);
      assert.notOk(model.isUserAuthorized(entity, 'delete'), 'Unexpected user to perform a delete without permission');
    });

  });

  // getOne method
  describe('getOne', function() {

    it('should be able to return an entity as retrieved by the provider', function() {
      var expectedEntity = {};
      var user = {id: ADMIN_ID};
      TestEntityProvider.prototype.getOne = function(id, filter, callback) {
        callback(null, expectedEntity);
      };

      provider = new TestEntityProvider(database, 'my_collection');
      var model = new TestContentModel(user, provider);

      model.getOne('42', null, function(error, entity) {
        assert.strictEqual(entity, expectedEntity);
      });
    });

    it('should return an access error if user does not have the authorization to perform a get', function() {
      var expectedEntity = {};
      var user = {id: '42'};
      TestEntityProvider.prototype.getOne = function(id, filter, callback) {
        callback(null, expectedEntity);
      };

      provider = new TestEntityProvider(database, 'my_collection');
      var model = new TestContentModel(user, provider);

      model.getOne('1', null, function(error, entity) {
        assert.ok(error instanceof AccessError);
      });
    });

  });

  // update method
  describe('update', function() {

    it('should be able to ask the provider to update an entity', function() {
      var expectedEntity = {};
      var user = {id: ADMIN_ID};
      TestEntityProvider.prototype.getOne = function(id, filter, callback) {
        callback(null, expectedEntity);
      };
      TestEntityProvider.prototype.update = function(id, data, callback) {
        callback(null, 1);
      };

      provider = new TestEntityProvider(database, 'my_collection');
      var model = new TestContentModel(user, provider);

      model.update('42', {}, function(error, updatedCount) {
        assert.equal(updatedCount, 1);
      });
    });

    it('should return an access error if user does not have the authorization to perform an update', function() {
      var expectedEntity = {};
      var user = {id: '42'};
      TestEntityProvider.prototype.getOne = function(id, filter, callback) {
        callback(null, expectedEntity);
      };
      TestEntityProvider.prototype.update = function(id, data, callback) {
        assert.ok(false, 'Unexpected update request');
      };

      provider = new TestEntityProvider(database, 'my_collection');
      var model = new TestContentModel(user, provider);

      model.getOne('1', null, function(error, entity) {
        assert.ok(error instanceof AccessError);
      });
    });

  });

  // remove method
  describe('remove', function() {

    it('should be able to ask the provider to remove an entity', function() {
      var expectedEntities = [{id: '42'}];
      var user = {id: ADMIN_ID};
      TestEntityProvider.prototype.get = function(filter, callback) {
        callback(null, expectedEntities);
      };
      TestEntityProvider.prototype.remove = function(ids, callback) {
        callback(null, ids.length);
      };

      provider = new TestEntityProvider(database, 'my_collection');
      var model = new TestContentModel(user, provider);

      model.remove(expectedEntities[0].id, function(error, deletedCount) {
        assert.equal(deletedCount, expectedEntities.length);
      });
    });

    it('should return an access error if user does not have the authorization to perform a delete', function() {
      var expectedEntities = [{id: '1'}];
      var user = {id: '42'};
      TestEntityProvider.prototype.get = function(filter, callback) {
        callback(null, expectedEntities);
      };
      TestEntityProvider.prototype.remove = function(ids, callback) {
        callback(null, ids.length);
      };

      provider = new TestEntityProvider(database, 'my_collection');
      var model = new TestContentModel(user, provider);

      model.remove(expectedEntities[0].id, function(error, deletedCount) {
        assert.equal(deletedCount, 0);
      });
    });

  });

  // addAccessFilter method
  describe('addAccessFilter', function() {

    it('should not filter when user is the administrator', function() {
      var user = {id: ADMIN_ID};
      var model = new TestContentModel(user, provider);

      var filter = model.addAccessFilter({});
      assert.notProperty(filter, '$or', 'Unexpected filter');
    });

    it('should filter by the user id and the id of the anonymous user', function() {
      var user = {id: '42'};
      var model = new TestContentModel(user, provider);
      var filter = model.addAccessFilter({});

      filter.$or.forEach(function(or) {
        if (or['metadata.user'])
          assert.sameMembers(or['metadata.user'].$in, [user.id, ANONYMOUS_ID], 'Expected to be filter by user id');
      });
    });

    it('should filter by user groups', function() {
      var groupName = 'mygroup';
      var groupName2 = 'mygroup2';
      var user = {
        id: '42',
        permissions: [
          'get-group-' + groupName,
          'get-group-' + groupName2
        ]
      };
      var model = new TestContentModel(user, provider);
      var filter = model.addAccessFilter({});

      filter.$or.forEach(function(or) {
        if (or['metadata.groups'])
          assert.sameMembers(or['metadata.groups'].$in, [groupName, groupName2], 'Expected to be filter by groups');
      });
    });

  });

});
