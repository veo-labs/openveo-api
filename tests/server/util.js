'use strict';

// Module dependencies
var assert = require('chai').assert;

// util.js
describe('util', function() {
  var util;

  // Intiializes tests
  before(function() {
    util = process.requireAPI('lib/util.js');
  });

  // merge function
  describe('merge', function() {

    it('Should be able to merge two objects with depth = 1', function() {
      var mergedObject = util.merge(
        {
          property1: 'value1',
          property2: 'value2'
        },
        {
          property1: 'newValue1',
          property3: 'value3'
        }
      );

      assert.equal(mergedObject.property1, 'newValue1');
      assert.equal(mergedObject.property2, 'value2');
      assert.equal(mergedObject.property3, 'value3');
    });

    it('Should be able to recursively merge two objects with depth > 1', function() {
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
      assert.equal(mergedObject.property1.subProperty1.subSubProperty2, 'subSubValue2');
      assert.equal(mergedObject.property1.subProperty2, 'subProperty2');
      assert.equal(mergedObject.property1.subProperty3(), 'function');
    });

  });

  // shallowValidateObject function
  describe('shallowValidateObject', function() {

    it('Should ignore unexpected property', function() {
      var validatedObject = util.shallowValidateObject({
        unnexpectedProperty: 'value'
      }, {});

      assert.isUndefined(validatedObject.unnexpectedProperty);
    });

    it('Should set value to null if type is not implemented', function() {
      var validatedObject = util.shallowValidateObject({
        stringProperty: 'value'
      }, {
        stringProperty: {type: 'unknown'}
      });

      assert.isNull(validatedObject.stringProperty);
    });

    // string type
    describe('string', function() {

      it('Should be able to validate a string', function() {
        var value = 'string value';
        var validatedObject = util.shallowValidateObject({
          stringProperty: value
        }, {
          stringProperty: {type: 'string'}
        });

        assert.equal(validatedObject.stringProperty, value);
      });

      it('Should set value to null if no value is found', function() {
        var validatedObject = util.shallowValidateObject({}, {
          stringProperty: {type: 'string'}
        });

        assert.isNull(validatedObject.stringProperty);
      });

      it('Should set value to the default value if value is not found', function() {
        var defaultValue = 'default value';
        var validatedObject = util.shallowValidateObject({}, {
          stringProperty: {type: 'string', default: defaultValue}
        });

        assert.equal(validatedObject.stringProperty, defaultValue);
      });

      it('Should throw an error if property is required and not found', function() {
        try {
          util.shallowValidateObject({}, {
            stringProperty: {type: 'string', required: true}
          });
        } catch (error) {
          return assert.ok(true);
        }

        assert.ok(false);
      });

      it('Should convert value to string if it\'s not', function() {
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

      it('Should throw an error if value is not available in the list of values', function() {
        var value = 'value';

        try {
          util.shallowValidateObject({
            stringProperty: value
          }, {
            stringProperty: {type: 'string', in: ['value1', 'value2']}
          });
        } catch (error) {
          return assert.ok(true);
        }

        assert.ok(false);
      });

      it('Should be able to validate a value from a list of values', function() {
        var value = 'value1';
        var validatedObject;

        try {
          validatedObject = util.shallowValidateObject({
            stringProperty: value
          }, {
            stringProperty: {type: 'string', in: ['value1', 'value2']}
          });
        } catch (error) {
          return assert.ok(false);
        }

        assert.equal(validatedObject.stringProperty, value);
      });

    });

    // number type
    describe('number', function() {

      it('Should be able to validate a number', function() {
        var value = 10;
        var validatedObject = util.shallowValidateObject({
          numberProperty: value
        }, {
          numberProperty: {type: 'number'}
        });

        assert.equal(validatedObject.numberProperty, value);
      });

      it('Should be able to validate a number with a list of numbers', function() {
        var value = 3;
        var validatedObject = util.shallowValidateObject({
          numberProperty: value
        }, {
          numberProperty: {type: 'number', in: [1, 2, 3, 4]}
        });

        assert.equal(validatedObject.numberProperty, value);
      });

      it('Should set value to null if no value is found', function() {
        var validatedObject = util.shallowValidateObject({}, {
          numberProperty: {type: 'number'}
        });

        assert.isNull(validatedObject.numberProperty);
      });

      it('Should throw an error if the value is not part of the list of numbers', function() {
        var value = 30;

        try {
          util.shallowValidateObject({
            numberProperty: value
          }, {
            numberProperty: {type: 'number', in: [1, 2, 3, 4]}
          });
        } catch (error) {
          return assert.ok(true);
        }

        assert.ok(false);
      });

      it('Should throw an error if property is required and not found', function() {
        try {
          util.shallowValidateObject({}, {
            numberProperty: {type: 'number', required: true}
          });
        } catch (error) {
          return assert.ok(true);
        }

        assert.ok(false);
      });

      it('Should be able to validate that the number is greater than another one', function() {
        try {
          util.shallowValidateObject({
            numberProperty: 30
          }, {
            numberProperty: {type: 'number', gt: 25}
          });
        } catch (error) {
          return assert.ok(false);
        }

        assert.ok(true);
      });

      it('Should be able to validate that the number is lesser than another one', function() {
        try {
          util.shallowValidateObject({
            numberProperty: 10
          }, {
            numberProperty: {type: 'number', lt: 20}
          });
        } catch (error) {
          return assert.ok(false);
        }

        assert.ok(true);
      });

      it('Should be able to validate that the number is greater of equal to another one', function() {
        try {
          util.shallowValidateObject({
            numberProperty: 20
          }, {
            numberProperty: {type: 'number', gte: 20}
          });
        } catch (error) {
          return assert.ok(false);
        }

        assert.ok(true);
      });

      it('Should be able to validate that the number is lesser of equal to another one', function() {
        try {
          util.shallowValidateObject({
            numberProperty: 20
          }, {
            numberProperty: {type: 'number', lte: 20}
          });
        } catch (error) {
          return assert.ok(false);
        }

        assert.ok(true);
      });

      it('Should throw an error if greater than validation failed', function() {
        try {
          util.shallowValidateObject({
            numberProperty: 20
          }, {
            numberProperty: {type: 'number', gt: 25}
          });
        } catch (error) {
          return assert.ok(true);
        }

        assert.ok(false);
      });

      it('Should throw an error if lesser than validation failed', function() {
        try {
          util.shallowValidateObject({
            numberProperty: 30
          }, {
            numberProperty: {type: 'number', lt: 25}
          });
        } catch (error) {
          return assert.ok(true);
        }

        assert.ok(false);
      });

      it('Should throw an error if greater or equal validation failed', function() {
        try {
          util.shallowValidateObject({
            numberProperty: 20
          }, {
            numberProperty: {type: 'number', gte: 25}
          });
        } catch (error) {
          return assert.ok(true);
        }

        assert.ok(false);
      });

      it('Should throw an error if lesser or equal validation failed', function() {
        try {
          util.shallowValidateObject({
            numberProperty: 30
          }, {
            numberProperty: {type: 'number', lte: 20}
          });
        } catch (error) {
          return assert.ok(true);
        }

        assert.ok(false);
      });

      it('Should set value to null if value is not a number', function() {
        var validatedObject;
        var value;

        // Object
        validatedObject = util.shallowValidateObject({
          numberProperty: {}
        }, {
          numberProperty: {type: 'number'}
        });

        assert.isNull(validatedObject.numberProperty);

        // Boolean
        validatedObject = util.shallowValidateObject({
          numberProperty: true
        }, {
          numberProperty: {type: 'number'}
        });

        assert.isNull(validatedObject.numberProperty);

        // Array
        value = ['value1', 'value2'];
        validatedObject = util.shallowValidateObject({
          numberProperty: value
        }, {
          numberProperty: {type: 'number'}
        });

        assert.isNull(validatedObject.numberProperty);
      });

    });

    // array type
    describe('array', function() {

      it('Should be able to validate an array<string> type', function() {
        var values = ['value1', 'value2'];

        var validatedObject = util.shallowValidateObject({
          arrayProperty: values
        }, {
          arrayProperty: {type: 'array<string>'}
        });

        assert.equal(validatedObject.arrayProperty.length, values.length);
      });

      it('Should accept a string and convert it to an array<string>', function() {
        var value = 'value';

        var validatedObject = util.shallowValidateObject({
          arrayProperty: value
        }, {
          arrayProperty: {type: 'array<string>'}
        });

        assert.equal(validatedObject.arrayProperty.length, 1);
        assert.equal(validatedObject.arrayProperty[0], value);
      });

      it('Should accept a number and convert it to an array<number>', function() {
        var value = 20;

        var validatedObject = util.shallowValidateObject({
          arrayProperty: value
        }, {
          arrayProperty: {type: 'array<number>'}
        });

        assert.equal(validatedObject.arrayProperty.length, 1);
        assert.equal(validatedObject.arrayProperty[0], value);
      });

      it('Should set value to null if value is an object', function() {
        var validatedObject;
        validatedObject = util.shallowValidateObject({
          arrayProperty: {}
        }, {
          arrayProperty: {type: 'array<string>'}
        });

        assert.isNull(validatedObject.arrayProperty);

        validatedObject = util.shallowValidateObject({
          arrayProperty: {}
        }, {
          arrayProperty: {type: 'array<number>'}
        });

        assert.isNull(validatedObject.arrayProperty);

      });

      it('Should convert values which are not strings or numbers', function() {
        var validatedObject;

        validatedObject = util.shallowValidateObject({
          arrayProperty: [{}, 25, []]
        }, {
          arrayProperty: {type: 'array<number>'}
        });

        assert.equal(validatedObject.arrayProperty.length, 1);

        validatedObject = util.shallowValidateObject({
          arrayProperty: [{key: 'value'}, 'value', ['value']]
        }, {
          arrayProperty: {type: 'array<string>'}
        });

        assert.equal(validatedObject.arrayProperty.length, 3);
      });

    });

    // date type
    describe('date', function() {

      it('Should be able to validate a literal date', function() {
        var dateLiteral = '03/22/2016';
        var date = new Date(dateLiteral);
        var validatedObject = util.shallowValidateObject({
          dateProperty: dateLiteral
        }, {
          dateProperty: {type: 'date'}
        });

        assert.equal(validatedObject.dateProperty, date.getTime());
      });

      it('Should be able to validate a date', function() {
        var date = new Date('03/22/2016');
        var validatedObject = util.shallowValidateObject({
          dateProperty: date
        }, {
          dateProperty: {type: 'date'}
        });

        assert.equal(validatedObject.dateProperty, date.getTime());
      });

      it('Should be able to validate that a date is greater than another one', function() {
        var date = new Date('03/22/2016');
        var validatedObject = util.shallowValidateObject({
          dateProperty: date
        }, {
          dateProperty: {type: 'date', gt: '03/21/2016'}
        });

        assert.equal(validatedObject.dateProperty, date.getTime());
      });

      it('Should be able to validate that a date is lesser than another one', function() {
        var date = new Date('03/22/2016');
        var validatedObject = util.shallowValidateObject({
          dateProperty: date
        }, {
          dateProperty: {type: 'date', lt: '03/23/2016'}
        });

        assert.equal(validatedObject.dateProperty, date.getTime());
      });

      it('Should be able to validate that a date is greater or equal to another one', function() {
        var date = new Date('03/23/2016');
        var validatedObject = util.shallowValidateObject({
          dateProperty: date
        }, {
          dateProperty: {type: 'date', gte: '03/23/2016'}
        });

        assert.equal(validatedObject.dateProperty, date.getTime());
      });

      it('Should be able to validate that a date is lesser or equal to another one', function() {
        var date = new Date('03/23/2016');
        var validatedObject = util.shallowValidateObject({
          dateProperty: date
        }, {
          dateProperty: {type: 'date', lte: '03/23/2016'}
        });

        assert.equal(validatedObject.dateProperty, date.getTime());
      });

    });

  });

});
