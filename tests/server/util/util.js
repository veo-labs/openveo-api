'use strict';

var fs = require('fs');
var path = require('path');
var assert = require('chai').assert;
var util = process.requireApi('lib/util.js');
var fileSystem = process.requireApi('lib/fileSystem.js');

// util.js
describe('util', function() {

  // merge function
  describe('merge', function() {

    it('should be able to merge two objects with depth = 1', function() {
      var mergedObject = util.merge(
        {
          property1: 'value1',
          property2: 'value2'
        },
        {
          property1: 'newValue1',
          property3: 'value3',
          property4: null
        }
      );

      assert.equal(mergedObject.property1, 'newValue1');
      assert.equal(mergedObject.property2, 'value2');
      assert.equal(mergedObject.property3, 'value3');
      assert.isNull(mergedObject.property4);
    });

    it('should be able to recursively merge two objects with depth > 1', function() {
      var mergedObject = util.merge(
        {
          property1: {
            subProperty1: {
              subSubProperty1: 'subSubValue1'
            }
          }
        },
        {
          property1: {
            subProperty1: {
              subSubProperty2: 'subSubValue2'
            },
            subProperty2: 'subProperty2',
            subProperty3: function() {
              return 'function';
            }
          }
        }
      );

      assert.equal(mergedObject.property1.subProperty1.subSubProperty1, 'subSubValue1');
      assert.equal(mergedObject.property1.subProperty1.subSubProperty1, 'subSubValue1');
      assert.equal(mergedObject.property1.subProperty1.subSubProperty2, 'subSubValue2');
      assert.equal(mergedObject.property1.subProperty2, 'subProperty2');
      assert.equal(mergedObject.property1.subProperty3(), 'function');
    });

    it('should return the first object if second object is not specified', function() {
      var object1 = {
        property1: 'value1',
        property2: 'value2'
      };
      var mergedObject = util.merge(object1, null);
      assert.strictEqual(mergedObject, object1);
    });

    it('should return the second object if first object is not specified', function() {
      var object2 = {
        property1: 'value1',
        property2: 'value2'
      };
      var mergedObject = util.merge(null, object2);
      assert.strictEqual(mergedObject, object2);
    });

  });

  // joinArray function
  describe('joinArray', function() {

    it('should be able to make union of two arrays', function() {
      var obj1 = {obj1: 'obj1'};
      var obj2 = {obj2: 'obj2'};
      var joinedArray = util.joinArray(
        [1, 2, 3, obj1, obj2, 'string1', null, undefined],
        [2, 4, obj2, 'string1', 'string2', null, undefined]
      );
      assert.sameMembers(joinedArray, [1, 2, 3, 4, obj1, obj2, 'string1', 'string2', null, undefined]);
    });

    it('should explode if one or both arguments or not arrays', function() {
      var invalidValues = [undefined, null, 42, {}];

      invalidValues.forEach(function(invalidValue) {
        assert.throws(function() {
          util.joinArray(invalidValue, []);
        }, Error, null, 'Expected exception when parameter 1 is ' + typeof invalidValue);

        assert.throws(function() {
          util.joinArray([], invalidValue);
        }, Error, null, 'Expected exception when parameter 2 is ' + typeof invalidValue);

        assert.throws(function() {
          util.joinArray(invalidValue, invalidValue);
        }, Error, null, 'Expected exception when both parameters are ' + typeof invalidValue);
      });

      assert.throws(function() {
        util.joinArray([], 'string');
      }, Error, null, 'Expected exception when parameter 2 is a string');

      assert.throws(function() {
        util.joinArray('string', 'string');
      }, Error, null, 'Expected exception when both parameters are strings');
    });

  });

  // intersectArray function
  describe('intersectArray', function() {

    it('should be able to make intersection of two arrays', function() {
      var obj1 = {obj1: 'obj1'};
      var obj2 = {obj2: 'obj2'};
      var tests = [
        {
          array1: [1, 2, 3, obj1, obj2, 'string1', null, undefined],
          array2: [2, 4, obj2, 'string1', 'string2', null, undefined],
          expectedArray: [2, obj2, 'string1', null, undefined]
        },
        {
          array1: ['1', '2', '3'],
          array2: ['1', '1'],
          expectedArray: ['1']
        },
        {
          array1: ['1'],
          array2: ['1', '2', '3'],
          expectedArray: ['1']
        },
        {
          array1: ['1', '1'],
          array2: ['1', '1'],
          expectedArray: ['1']
        },
        {
          array1: [1, 1],
          array2: [1],
          expectedArray: [1]
        },
        {
          array1: [],
          array2: [],
          expectedArray: []
        },
        {
          array1: [1],
          array2: [2],
          expectedArray: []
        }
      ];

      for (var i = 0; i < tests.length; i++) {
        var test = tests[i];

        assert.sameMembers(
          util.intersectArray(test.array1, test.array2),
          test.expectedArray,
          'Wrong array values for test ' + i
        );
      }

    });

    it('should explode if one or both arguments or not arrays', function() {
      var invalidValues = [undefined, null, 42, {}];

      invalidValues.forEach(function(invalidValue) {
        assert.throws(function() {
          util.intersectArray(invalidValue, ['string']);
        }, Error, null, 'Expected exception when parameter 1 is ' + typeof invalidValue);

        assert.throws(function() {
          util.intersectArray(['string'], invalidValue);
        }, Error, null, 'Expected exception when parameter 2 is ' + typeof invalidValue);

        assert.throws(function() {
          util.intersectArray(invalidValue, invalidValue);
        }, Error, null, 'Expected exception when both parameters are ' + typeof invalidValue);
      });
    });

  });

  // areSameArrays function
  describe('areSameArrays', function() {

    it('should be able to compare two arrays', function() {
      var values = ['string', 42, {}, function() {}, []];
      assert.ok(util.areSameArrays(['value1'], ['value1']));

      values.forEach(function(value) {
        assert.ok(util.areSameArrays([value], [value]));
      });
    });

    it('should ignore the order when comparing', function() {
      assert.ok(util.areSameArrays(['value1', 'value2'], ['value2', 'value1']));
    });

    it('should compare references not copies', function() {
      assert.notOk(util.areSameArrays([{}], [{}]));
      assert.notOk(util.areSameArrays([function() {}], [function() {}]));
      assert.notOk(util.areSameArrays([[]], [[]]));
    });

    it('should return false if one array contains more than the values of the other', function() {
      assert.notOk(util.areSameArrays(['value1'], ['value1', 'value2']));
    });
  });

  // isEmailValid function
  describe('isEmailValid', function() {

    it('should be able to validate an email', function() {
      var validEmails = [
        'peter.venkman@ghosts.com',
        'peter-venkman@ghosts',
        'peter+venkman@ghosts.com',
        'peter venkman@ghosts.com',
        'p@ghosts',
        '#!$%&\'*+-/=?^_`{}|~@ghosts.com'
      ];
      var invalidEmails = [
        '@ghosts',
        'peter-venkman',
        'peter-venkman.com',
        '"petervenkman"@ghosts.com'
      ];

      validEmails.forEach(function(email) {
        assert.ok(util.isEmailValid(email), 'Expected ' + email + ' to be valid');
      });

      invalidEmails.forEach(function(email) {
        assert.notOk(util.isEmailValid(email), 'Expected ' + email + ' to be valid');
      });
    });

    it('should return false if the email is not a valid string', function() {
      assert.notOk(util.isEmailValid([]), 'Expected an array to be an invalid email');
      assert.notOk(util.isEmailValid(42), 'Expected a number to be an invalid email');
      assert.notOk(util.isEmailValid(null), 'Expected null to be an invalid email');
      assert.notOk(util.isEmailValid(undefined), 'Expected undefined to be an invalid email');
    });

  });

  // isContained function
  describe('isContained', function() {

    it('should be able to test if a value is contained into another', function() {
      var values = [
        'string',
        42,
        ['string1', 'string2'],
        {
          key: 'value',
          key2: 42,
          key3: ['string'],
          key4: [42],
          key5: {
            key51: 'value'
          },
          key6: [{
            key61: ['string'],
            key62: 42
          }]
        },
        undefined,
        null
      ];

      values.forEach(function(value) {
        assert.ok(util.isContained(value, value), 'Expected same ' + JSON.stringify(value) + ' to be valid');
      });
    });

  });

  // shallowValidateObject function
  describe('shallowValidateObject', function() {

    it('should ignore unexpected property', function() {
      var validatedObject = util.shallowValidateObject({
        unnexpectedProperty: 'value'
      }, {});

      assert.isUndefined(validatedObject.unnexpectedProperty);
    });

    it('should ignore value if type is not implemented', function() {
      var validatedObject = util.shallowValidateObject({
        stringProperty: 'value'
      }, {
        stringProperty: {type: 'unknown'}
      });

      assert.isUndefined(validatedObject.stringProperty);
    });

    it('should return an empty object if no validation object is specified', function() {
      var validatedObject = util.shallowValidateObject({
        myProperty: 'value'
      }, null);

      assert.isObject(validatedObject);
      assert.equal(Object.keys(validatedObject).length, 0, 'Expected object to be empty');
    });

    it('should throws an exception if no object is specified', function() {
      assert.throws(function() {
        util.shallowValidateObject(null, {stringProperty: {type: 'string'}});
      }, TypeError, null, 'Expected exception when validating null');
    });

    // string type
    describe('string', function() {

      it('should be able to validate a string', function() {
        var value = 'string value';
        var validatedObject = util.shallowValidateObject({
          stringProperty: value
        }, {
          stringProperty: {type: 'string'}
        });

        assert.equal(validatedObject.stringProperty, value);
      });

      it('should ignore property if value is not found', function() {
        var validatedObject = util.shallowValidateObject({}, {
          stringProperty: {type: 'string'}
        });

        assert.isUndefined(validatedObject.stringProperty);
      });

      it('should set value to the default value if value is not found', function() {
        var defaultValue = 'default value';
        var validatedObject = util.shallowValidateObject({}, {
          stringProperty: {type: 'string', default: defaultValue}
        });

        assert.equal(validatedObject.stringProperty, defaultValue);
      });

      it('should throw an error if property is required and not found', function() {
        assert.throws(function() {
          util.shallowValidateObject({}, {
            stringProperty: {type: 'string', required: true}
          });
        });
      });

      it('should convert value to string if it\'s not', function() {
        var validatedObject;
        var value;

        // Object
        validatedObject = util.shallowValidateObject({
          stringProperty: {}
        }, {
          stringProperty: {type: 'string'}
        });

        assert.equal(validatedObject.stringProperty, '[object Object]');

        // Boolean
        validatedObject = util.shallowValidateObject({
          stringProperty: true
        }, {
          stringProperty: {type: 'string'}
        });

        assert.equal(validatedObject.stringProperty, 'true');

        // Array
        value = ['value1', 'value2'];
        validatedObject = util.shallowValidateObject({
          stringProperty: value
        }, {
          stringProperty: {type: 'string'}
        });

        assert.equal(validatedObject.stringProperty, value.join(','));

        // Number
        validatedObject = util.shallowValidateObject({
          stringProperty: 1
        }, {
          stringProperty: {type: 'string'}
        });

        assert.equal(validatedObject.stringProperty, '1');
      });

      it('should throw an error if value is not available in the list of values', function() {
        var value = 'value';

        assert.throws(function() {
          util.shallowValidateObject({
            stringProperty: value
          }, {
            stringProperty: {type: 'string', in: ['value1', 'value2']}
          });
        });
      });

      it('should be able to validate a value from a list of values', function() {
        var value = 'value1';
        var validatedObject;

        assert.doesNotThrow(function() {
          validatedObject = util.shallowValidateObject({
            stringProperty: value
          }, {
            stringProperty: {type: 'string', in: [value, 'value2']}
          });
        });

        assert.equal(validatedObject.stringProperty, value);
      });

    });

    // number type
    describe('number', function() {

      it('should be able to validate a number', function() {
        var value = 10;
        var validatedObject = util.shallowValidateObject({
          numberProperty: value
        }, {
          numberProperty: {type: 'number'}
        });

        assert.equal(validatedObject.numberProperty, value);
      });

      it('should be able to validate a number with a list of numbers', function() {
        var value = 3;
        var validatedObject = util.shallowValidateObject({
          numberProperty: value
        }, {
          numberProperty: {type: 'number', in: [1, 2, 3, 4]}
        });

        assert.equal(validatedObject.numberProperty, value);
      });

      it('should ignore value if no value is found', function() {
        var validatedObject = util.shallowValidateObject({}, {
          numberProperty: {type: 'number'}
        });

        assert.isUndefined(validatedObject.numberProperty);
      });

      it('should throw an error if the value is not part of the list of numbers', function() {
        var value = 30;

        assert.throws(function() {
          util.shallowValidateObject({
            numberProperty: value
          }, {
            numberProperty: {type: 'number', in: [1, 2, 3, 4]}
          });
        });
      });

      it('should throw an error if property is required and not found', function() {
        assert.throws(function() {
          util.shallowValidateObject({}, {
            numberProperty: {type: 'number', required: true}
          });
        });
      });

      it('should be able to validate that the number is greater than another one', function() {
        assert.doesNotThrow(function() {
          util.shallowValidateObject({
            numberProperty: 30
          }, {
            numberProperty: {type: 'number', gt: 0}
          });
        });
      });

      it('should be able to validate that the number is lesser than another one', function() {
        assert.doesNotThrow(function() {
          util.shallowValidateObject({
            numberProperty: -10
          }, {
            numberProperty: {type: 'number', lt: 0}
          });
        });
      });

      it('should be able to validate that the number is greater of equal to another one', function() {
        assert.doesNotThrow(function() {
          util.shallowValidateObject({
            numberProperty: 0
          }, {
            numberProperty: {type: 'number', gte: 0}
          });
        });
      });

      it('should be able to validate that the number is lesser of equal to another one', function() {
        assert.doesNotThrow(function() {
          util.shallowValidateObject({
            numberProperty: 0
          }, {
            numberProperty: {type: 'number', lte: 0}
          });
        });
      });

      it('should throw an error if greater than validation failed', function() {
        assert.throws(function() {
          util.shallowValidateObject({
            numberProperty: 20
          }, {
            numberProperty: {type: 'number', gt: 25}
          });
        });
      });

      it('should throw an error if lesser than validation failed', function() {
        assert.throws(function() {
          util.shallowValidateObject({
            numberProperty: 30
          }, {
            numberProperty: {type: 'number', lt: 25}
          });
        });
      });

      it('should throw an error if greater or equal validation failed', function() {
        assert.throws(function() {
          util.shallowValidateObject({
            numberProperty: 20
          }, {
            numberProperty: {type: 'number', gte: 25}
          });
        });
      });

      it('should throw an error if lesser or equal validation failed', function() {
        assert.throws(function() {
          util.shallowValidateObject({
            numberProperty: 30
          }, {
            numberProperty: {type: 'number', lte: 20}
          });
        });
      });

      it('should ignore property if value is not a number', function() {
        var validatedObject;
        var value;

        // Object
        validatedObject = util.shallowValidateObject({
          numberProperty: {}
        }, {
          numberProperty: {type: 'number'}
        });

        assert.isUndefined(validatedObject.numberProperty);

        // Boolean
        validatedObject = util.shallowValidateObject({
          numberProperty: true
        }, {
          numberProperty: {type: 'number'}
        });

        assert.isUndefined(validatedObject.numberProperty);

        // Array
        value = ['value1', 'value2'];
        validatedObject = util.shallowValidateObject({
          numberProperty: value
        }, {
          numberProperty: {type: 'number'}
        });

        assert.isUndefined(validatedObject.numberProperty);
      });

      it('should ignore property if not defined', function() {
        var validatedObject = util.shallowValidateObject({
        }, {
          numberProperty: {type: 'number', gt: 0}
        });

        assert.isUndefined(validatedObject.numberProperty);
      });

    });

    // array<string> type
    describe('array<string>', function() {

      it('should be able to validate an array<string> type', function() {
        var values = ['value1', 'value2'];

        var validatedObject = util.shallowValidateObject({
          arrayProperty: values
        }, {
          arrayProperty: {type: 'array<string>'}
        });

        assert.equal(validatedObject.arrayProperty.length, values.length);
      });

      it('should accept a string and convert it to an array<string>', function() {
        var value = 'value';

        var validatedObject = util.shallowValidateObject({
          arrayProperty: value
        }, {
          arrayProperty: {type: 'array<string>'}
        });

        assert.equal(validatedObject.arrayProperty.length, 1);
        assert.equal(validatedObject.arrayProperty[0], value);
      });

      it('should throw an error if value is an object', function() {
        assert.throws(function() {
          util.shallowValidateObject({
            arrayProperty: {}
          }, {
            arrayProperty: {type: 'array<string>'}
          });
        });
      });

      it('should convert values which are not strings', function() {
        var validatedObject = util.shallowValidateObject({
          arrayProperty: [{key: 'value'}, 'value', ['value']]
        }, {
          arrayProperty: {type: 'array<string>'}
        });

        assert.equal(validatedObject.arrayProperty.length, 3);
      });

      it('should be able to validate strings inside the array', function() {
        var expectedValue = 'value1';
        var validatedObject = util.shallowValidateObject({
          arrayProperty: [expectedValue]
        }, {
          arrayProperty: {type: 'array<string>', in: [expectedValue, 'value2']}
        });

        assert.equal(validatedObject.arrayProperty[0], expectedValue);
        assert.equal(validatedObject.arrayProperty.length, 1);
      });

      it('should throw an error if a string inside the array cannot be found inside in', function() {
        assert.throws(function() {
          util.shallowValidateObject({
            arrayProperty: ['wrong value']
          }, {
            arrayProperty: {type: 'array<string>', in: ['expected value']}
          });
        });
      });

    });

    // array<number> type
    describe('array<number>', function() {

      it('should be able to validate an array<number> type', function() {
        var values = [42, 43];

        var validatedObject = util.shallowValidateObject({
          arrayProperty: values
        }, {
          arrayProperty: {type: 'array<number>'}
        });

        assert.equal(validatedObject.arrayProperty.length, values.length);
      });

      it('should accept a number and convert it to an array<number>', function() {
        var value = 20;

        var validatedObject = util.shallowValidateObject({
          arrayProperty: value
        }, {
          arrayProperty: {type: 'array<number>'}
        });

        assert.equal(validatedObject.arrayProperty.length, 1);
        assert.equal(validatedObject.arrayProperty[0], value);
      });

      it('should throw an error if value is an object', function() {
        assert.throws(function() {
          util.shallowValidateObject({
            arrayProperty: {}
          }, {
            arrayProperty: {type: 'array<number>'}
          });
        });
      });

      it('should convert values which are not numbers', function() {
        var validatedObject = util.shallowValidateObject({
          arrayProperty: [{}, 25, []]
        }, {
          arrayProperty: {type: 'array<number>'}
        });

        assert.equal(validatedObject.arrayProperty.length, 1);
      });

      it('should be able to validate numbers inside the array', function() {
        var expectedValue = 42;
        var validatedObject = util.shallowValidateObject({
          arrayProperty: [expectedValue]
        }, {
          arrayProperty: {type: 'array<number>', in: [expectedValue, 43]}
        });

        assert.equal(validatedObject.arrayProperty[0], expectedValue);
        assert.equal(validatedObject.arrayProperty.length, 1);
      });

      it('should throw an error if a number inside the array cannot be found inside in', function() {
        assert.throws(function() {
          util.shallowValidateObject({
            arrayProperty: [1]
          }, {
            arrayProperty: {type: 'array<number>', in: [42]}
          });
        });
      });

    });

    // array<object> type
    describe('array<object>', function() {

      it('should be able to validate an array<object> type', function() {
        var values = [{}, {}];

        var validatedObject = util.shallowValidateObject({
          arrayProperty: values
        }, {
          arrayProperty: {type: 'array<object>'}
        });

        assert.equal(validatedObject.arrayProperty.length, values.length);
      });

      it('should throw an error if value is an object', function() {
        assert.throws(function() {
          util.shallowValidateObject({
            arrayProperty: {}
          }, {
            arrayProperty: {type: 'array<object>'}
          });
        });
      });

      it('should ignore values which are not objects', function() {
        var validatedObject = util.shallowValidateObject({
          arrayProperty: [{}, 25, []]
        }, {
          arrayProperty: {type: 'array<object>'}
        });

        assert.equal(validatedObject.arrayProperty.length, 1);
      });

    });

    // date type
    describe('date', function() {

      it('should be able to validate a literal date', function() {
        var dateLiteral = '03/22/2016';
        var date = new Date(dateLiteral);
        var validatedObject = util.shallowValidateObject({
          dateProperty: dateLiteral
        }, {
          dateProperty: {type: 'date'}
        });

        assert.equal(validatedObject.dateProperty, date.getTime());
      });

      it('should be able to validate a timestamp', function() {
        var date = new Date();
        var validatedObject = util.shallowValidateObject({
          dateProperty: date.getTime()
        }, {
          dateProperty: {type: 'date'}
        });

        assert.strictEqual(validatedObject.dateProperty, date.getTime());
      });

      it('should be able to validate a timestamp as a string', function() {
        var date = new Date();
        var validatedObject = util.shallowValidateObject({
          dateProperty: String(date.getTime())
        }, {
          dateProperty: {type: 'date'}
        });

        assert.strictEqual(validatedObject.dateProperty, date.getTime());
      });

      it('should be able to validate a date', function() {
        var date = new Date('03/22/2016');
        var validatedObject = util.shallowValidateObject({
          dateProperty: date
        }, {
          dateProperty: {type: 'date'}
        });

        assert.equal(validatedObject.dateProperty, date.getTime());
      });

      it('should be able to validate that a date is greater than another one', function() {
        var date = new Date('03/22/2016');
        var validatedObject = util.shallowValidateObject({
          dateProperty: date
        }, {
          dateProperty: {type: 'date', gt: '03/21/2016'}
        });

        assert.equal(validatedObject.dateProperty, date.getTime());
      });

      it('should be able to validate that a date is lesser than another one', function() {
        var date = new Date('03/22/2016');
        var validatedObject = util.shallowValidateObject({
          dateProperty: date
        }, {
          dateProperty: {type: 'date', lt: '03/23/2016'}
        });

        assert.equal(validatedObject.dateProperty, date.getTime());
      });

      it('should be able to validate that a date is greater or equal to another one', function() {
        var date = new Date('03/23/2016');
        var validatedObject = util.shallowValidateObject({
          dateProperty: date
        }, {
          dateProperty: {type: 'date', gte: '03/23/2016'}
        });

        assert.equal(validatedObject.dateProperty, date.getTime());
      });

      it('should be able to validate that a date is lesser or equal to another one', function() {
        var date = new Date('03/23/2016');
        var validatedObject = util.shallowValidateObject({
          dateProperty: date
        }, {
          dateProperty: {type: 'date', lte: '03/23/2016'}
        });

        assert.equal(validatedObject.dateProperty, date.getTime());
      });

      it('should ignore an invalid date', function() {
        var validatedObject = util.shallowValidateObject({
          dateProperty: {}
        }, {
          dateProperty: {type: 'date'}
        });

        assert.isUndefined(validatedObject.dateProperty, 'Unexpected date');
      });

    });

    // boolean type
    describe('boolean', function() {

      it('should convert value to a Boolean if not null or undefined', function() {
        var values = ['a', {}, [], 42, /.*/];

        values.forEach(function(value) {
          var validatedObject = util.shallowValidateObject({
            booleanProperty: value
          }, {
            booleanProperty: {type: 'boolean'}
          });

          assert.strictEqual(validatedObject.booleanProperty, true);
        });
      });

      it('should ignore value if null or undefined', function() {
        var values = [null, undefined];

        values.forEach(function(value) {
          var validatedObject = util.shallowValidateObject({
            booleanProperty: value
          }, {
            booleanProperty: {type: 'boolean'}
          });

          assert.isUndefined(validatedObject.booleanProperty);
        });
      });

      it('should use default value if null or undefined', function() {
        var values = [null, undefined];

        values.forEach(function(value) {
          var validatedObject = util.shallowValidateObject({
            booleanProperty: value
          }, {
            booleanProperty: {type: 'boolean', default: true}
          });

          assert.strictEqual(validatedObject.booleanProperty, true);
        });
      });

    });

    // file type
    describe('file', function() {
      var TYPES = [
        fileSystem.FILE_TYPES.JPG,
        fileSystem.FILE_TYPES.GIF,
        fileSystem.FILE_TYPES.PNG,
        fileSystem.FILE_TYPES.TAR,
        fileSystem.FILE_TYPES.MP4
      ];

      TYPES.forEach(function(TYPE) {

        it('should convert binary ' + TYPE + ' data into an object with type and Buffer', function(done) {
          fs.readFile(
            path.join(__dirname, 'resources/' + TYPE.toUpperCase() + '.' + TYPE.toLowerCase()),
            function(error, data) {
              var validatedObject = util.shallowValidateObject({
                fileProperty: data.toString('binary')
              }, {
                fileProperty: {type: 'file'}
              });

              assert.equal(validatedObject.fileProperty.type, TYPE, 'Unexpected file type');
              assert.instanceOf(validatedObject.fileProperty.file, Buffer, 'Expected a buffer');
              done();
            }
          );
        });

        it('should convert ' + TYPE + ' buffer into an object with type and Buffer', function(done) {
          fs.readFile(
            path.join(__dirname, 'resources/' + TYPE.toUpperCase() + '.' + TYPE.toLowerCase()),
            function(error, data) {
              var validatedObject = util.shallowValidateObject({
                fileProperty: Buffer.from(data, 'binary')
              }, {
                fileProperty: {type: 'file'}
              });

              assert.equal(validatedObject.fileProperty.type, TYPE, 'Unexpected file type');
              assert.instanceOf(validatedObject.fileProperty.file, Buffer, 'Expected a buffer');
              done();
            }
          );
        });

        it('should ignore value if not a string', function() {
          var values = [null, undefined, 42, {}, []];

          values.forEach(function(value) {
            var validatedObject = util.shallowValidateObject({
              fileProperty: value
            }, {
              fileProperty: {type: 'file'}
            });

            assert.isUndefined(validatedObject.fileProperty);
          });
        });

        it('should throw an error if property is required and not found', function() {
          assert.throws(function() {
            util.shallowValidateObject({}, {
              fileProperty: {type: 'file', required: true}
            });
          });
        });

        it('should throw an error if file type is not supported', function() {
          assert.throws(function() {
            util.shallowValidateObject({
              fileProperty: Buffer.from('Wrong file type').toString('binary')
            }, {
              fileProperty: {type: 'file', required: true, in: TYPES}
            });
          });
        });

        it('should throw an error if file is not one of the expected types', function(done) {
          fs.readFile(path.join(__dirname, 'resources/' + TYPE + '.' + TYPE.toLowerCase()), function(error, data) {
            var otherTypes = TYPES.filter(function(type) {
              return type !== TYPE;
            });

            assert.throws(function() {
              util.shallowValidateObject({
                fileProperty: data.toString('binary')
              }, {
                fileProperty: {type: 'file', in: otherTypes}
              });
            });

            done();
          });
        });

      });

    });

  });

  // validateFiles method
  describe('validateFiles', function() {
    var TYPES = [
      fileSystem.FILE_TYPES.JPG,
      fileSystem.FILE_TYPES.GIF,
      fileSystem.FILE_TYPES.PNG,
      fileSystem.FILE_TYPES.TAR,
      fileSystem.FILE_TYPES.MP4
    ];

    TYPES.forEach(function(TYPE) {

      it('should be able to validate a file of type ' + TYPE, function(done) {
        util.validateFiles({
          file: path.join(__dirname, '/resources/' + TYPE.toUpperCase() + '.' + TYPE.toLowerCase())
        }, {
          file: {in: [TYPE]}
        }, function(error, files) {
          assert.isNull(error);
          assert.ok(files.file.isValid);
          assert.equal(files.file.type, TYPE);
          done();
        });
      });

      it('should be able to validate a file of type ' + TYPE + ' and its extension', function(done) {
        util.validateFiles({
          file: path.join(__dirname, '/resources/' + TYPE.toUpperCase() + '.' + TYPE.toLowerCase())
        }, {
          file: {in: [TYPE]},
          validateExtension: true
        }, function(error, files) {
          assert.isNull(error);
          assert.ok(files.file.isValid);
          assert.equal(files.file.type, TYPE);
          done();
        });
      });

    });

    it('should consider file invalid if extension does not correspond to its type while "validateExtension" is set',
      function(done) {
        util.validateFiles({
          file: path.join(__dirname, '/resources/tarWithWrongExtension.tar.part')
        }, {
          file: {
            in: [fileSystem.FILE_TYPES.TAR],
            validateExtension: true
          }
        }, function(error, files) {
          assert.isNull(error);
          assert.notOk(files.file.isValid);
          done();
        });
      }
    );

    it('should consider an unknown file with .tar extension as a tar file', function(done) {
      util.validateFiles({
        file: path.join(__dirname, '/resources/wrongTar.tar')
      }, {
        file: {in: [fileSystem.FILE_TYPES.TAR]}
      }, function(error, files) {
        assert.isNull(error);
        assert.ok(files.file.isValid);
        assert.equal(files.file.type, fileSystem.FILE_TYPES.TAR);
        done();
      });
    });

    it('should execute callback with an error if no files provided', function(done) {
      util.validateFiles(null, {
        file: {in: [fileSystem.FILE_TYPES.JPG]}
      }, function(error, files) {
        assert.isDefined(error);
        assert.isUndefined(files);
        done();
      });
    });

    it('should execute callback with an error if no validation description provided', function(done) {
      util.validateFiles({
        file: path.join(__dirname, '/resources/GIF.gif')
      }, null, function(error, files) {
        assert.isDefined(error);
        assert.isUndefined(files);
        done();
      });
    });

    it('should execute callback with an error if neither validation nor files provided', function(done) {
      util.validateFiles(null, null, function(error, files) {
        assert.isDefined(error);
        assert.isUndefined(files);
        done();
      });
    });

  });

  // getPropertyFromArray method
  describe('getPropertyFromArray', function() {

    it('should be able to get values of a property from an Array of Objects', function() {
      var expectedValues = [42, 43];
      var expectedProperty = 'id';
      var list = [];

      expectedValues.forEach(function(value) {
        list.push({[expectedProperty]: value});
      });

      var values = util.getPropertyFromArray('id', list);
      assert.sameMembers(values, expectedValues);
    });

    it('should be able to get values of a property from an Array of Objects and its sub Array(s)', function() {
      var expectedValues = [42, 43];
      var expectedProperty = 'id';
      var expectedRecursiveProperty = 'subItems';
      var list = [
        {
          [expectedProperty]: expectedValues[0],
          [expectedRecursiveProperty]: [
            {[expectedProperty]: expectedValues[1]}
          ]
        }
      ];

      var values = util.getPropertyFromArray('id', list, expectedRecursiveProperty);
      assert.sameMembers(values, expectedValues);
    });

    it('should be able to get values of a property from sub Array(s) starting at a given value', function() {
      var expectedValues = [42, 43, 44];
      var expectedProperty = 'id';
      var expectedRecursiveProperty = 'subItems';
      var list = [
        {
          [expectedProperty]: expectedValues[0],
          [expectedRecursiveProperty]: [
            {
              [expectedProperty]: expectedValues[1],
              [expectedRecursiveProperty]: [
                {
                  [expectedProperty]: expectedValues[2]
                }
              ]
            }
          ]
        }
      ];

      var values = util.getPropertyFromArray(expectedProperty, list, expectedRecursiveProperty, expectedValues[0]);
      assert.deepEqual(values, expectedValues.slice(1), 'Expected the list of values minus one');

      values = util.getPropertyFromArray(expectedProperty, list, expectedRecursiveProperty, expectedValues[1]);
      assert.deepEqual(values, expectedValues.slice(2), 'Expected the list of values minus two');
    });

    it('should ignore sibling categories in case of starting value', function() {
      var expectedValues = [42, 43, 44, 45];
      var expectedProperty = 'id';
      var expectedRecursiveProperty = 'subItems';
      var list = [
        {
          [expectedProperty]: expectedValues[0],
          [expectedRecursiveProperty]: [
            {
              [expectedProperty]: expectedValues[1],
              [expectedRecursiveProperty]: [
                {
                  [expectedProperty]: expectedValues[2]
                }
              ]
            },
            {
              [expectedProperty]: expectedValues[3]
            }
          ]
        }
      ];

      var values = util.getPropertyFromArray(expectedProperty, list, expectedRecursiveProperty, expectedValues[0]);
      assert.deepEqual(values, expectedValues.slice(1), 'Expected the list of values minus the last one');
    });

    it('should return an empty Array if property is not specified', function() {
      var list = [{}, {}];
      var expectedRecursiveProperty = 'subItems';
      var values = util.getPropertyFromArray(null, list, expectedRecursiveProperty);
      assert.isEmpty(values);
    });

    it('should return an empty Array if list is not specified', function() {
      var expectedProperty = 'id';
      var expectedRecursiveProperty = 'subItems';
      var values = util.getPropertyFromArray(expectedProperty, null, expectedRecursiveProperty);
      assert.isEmpty(values);
    });

    it('should return an empty Array if startValue is not found', function() {
      var expectedValues = [42];
      var expectedProperty = 'id';
      var expectedRecursiveProperty = 'subItems';
      var list = [
        {
          [expectedProperty]: expectedValues[0]
        }
      ];
      var values = util.getPropertyFromArray(expectedProperty, list, expectedRecursiveProperty, 'Wrong value');
      assert.isEmpty(values);
    });

    it('should return an empty Array if startValue corresponds to an Object without a sub Array', function() {
      var expectedValues = [42];
      var expectedProperty = 'id';
      var expectedRecursiveProperty = 'subItems';
      var list = [
        {
          [expectedProperty]: expectedValues[0]
        }
      ];
      var values = util.getPropertyFromArray(expectedProperty, list, expectedRecursiveProperty, expectedValues[0]);
      assert.isEmpty(values);
    });

  });

  // evaluateDeepObjectProperties method
  describe('evaluateDeepObjectProperties', function() {

    it('should be able to evaluate a property path on an object', function() {
      var expectedValues = ['string', [], 42, {}, function() {}];

      expectedValues.forEach(function(expectedValue) {
        assert.strictEqual(util.evaluateDeepObjectProperties('deep.deep.property', {
          deep: {
            deep: {
              property: expectedValue
            }
          }
        }), expectedValue);
      });
    });

    it('should be able to evaluate a property path with only one level', function() {
      var expectedValue = 'value';
      assert.strictEqual(util.evaluateDeepObjectProperties('property', {
        property: expectedValue
      }), expectedValue);
    });

    it('should return null if object is not an object', function() {
      var invalidValues = [42, 'string'];

      invalidValues.forEach(function(invalidValue) {
        assert.isNull(util.evaluateDeepObjectProperties('property', invalidValue));
      });
    });

    it('should throw an error if object is null or undefined', function() {
      var invalidValues = [null, undefined];

      invalidValues.forEach(function(invalidValue) {
        assert.throws(function() {
          util.evaluateDeepObjectProperties('property', invalidValue);
        }, TypeError, null, 'Expected exception when object parameter is ' + typeof invalidValue);
      });
    });

  });

  // escapeTextForRegExp method
  describe('escapeTextForRegExp', function() {

    it('should be able to escape all characters specific to JavaScript regular expressions', function() {
      var regExpCharacters = ['*', '[', ']', '{', '}', '(', ')', '.', '?', '/', '+', '\\', '^', '$', '|'];

      regExpCharacters.forEach(function(regExpCharacter) {
        assert.equal(util.escapeTextForRegExp(regExpCharacter), '\\' + regExpCharacter);
      });
    });

    it('should throw a TypeError if text is not a String', function() {
      var invalidValues = [null, undefined, [], {}, true];

      invalidValues.forEach(function(invalidValue) {
        assert.throws(function() {
          util.escapeTextForRegExp(invalidValue);
        }, TypeError, null, 'Expected exception when parameter is of type ' + typeof invalidValue);
      });
    });
  });

});
