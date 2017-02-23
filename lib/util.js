'use strict';

var util = require('util');

/**
 * Provides functions for common JavaScript operations.
 *
 *     // Load module "util"
 *     var util = require('@openveo/api').util;
 *
 * @module util
 * @class util
 * @main util
 */

// Supported file types with associated magic numbers
var FILE_TYPES = {
  JPG: 'ffd8ffe0',
  PNG: '89504e47',
  GIF: '47494638'
};

Object.freeze(FILE_TYPES);

/**
 * Merges, recursively, all properties of object2 in object1.
 *
 * This will not create copies of objects.
 *
 * @method merge
 * @static
 * @param {Object} object1 The JavaScript final object
 * @param {Object} object2 A second JavaScript object to merge into
 * the first one
 * @return {Object} object1
 */
module.exports.merge = function(object1, object2) {
  if (!object2)
    return object1;

  if (!object1)
    return object2;

  for (var property in object2) {

    try {

      // Object property is an object
      // Recusively merge its properties
      if (typeof object2[property] === 'object' && !util.isArray(object2[property])) {
        object1[property] = object1[property] || {};
        object1[property] = this.merge(object1[property], object2[property]);
      } else
        object1[property] = object2[property];

    } catch (e) {

      // Property does not exist in object1, create it
      object1[property] = object2[property];

    }

  }

  return object1;
};

/**
 * Makes union of two arrays.
 *
 * @method joinArray
 * @static
 * @param {Array} [array1] An array
 * @param {Array} [array2] An array
 * @return {Array} The union of the two arrays
 */
module.exports.joinArray = function(array1, array2) {
  return array1.concat(array2.filter(function(item) {
    return array1.indexOf(item) < 0;
  }));
};

/**
 * Makes intersection of two arrays.
 *
 * @method intersectArray
 * @static
 * @param {Array} [array1] An array
 * @param {Array} [array2] An array
 * @return {Array} The intersection of the two arrays
 */
module.exports.intersectArray = function(array1, array2) {
  return array2.filter(function(item) {
    return array1.indexOf(item) >= 0;
  });
};

/**
 * Checks if an email address is valid or not.
 *
 * @method isEmailValid
 * @static
 * @param {String} email The email address
 * @return {Boolean} true if the email is valid, false otherwise
 */
module.exports.isEmailValid = function(email) {
  var reg = new RegExp('[a-z0-9!#$%&\'*+\/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&\'*+\/=?^_`{|}~-]+)*@(?:[a-z0-9]' +
                       '(?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?');
  return reg.test(email);
};

/**
 * Checks if a value is isContained into another comparing primitive types.
 *
 * All values in expectedValue must be found in value to pass the test.
 *
 * @method isContained
 * @static
 * @param {Object|Number|String|Array} expectedValue The value expecting to be found in "value"
 * @return {Boolean} true if the expected value has been found in value
 */
module.exports.isContained = function(expectedValue, value) {
  if (Object.prototype.toString.call(expectedValue) === '[object Array]') {
    if (Object.prototype.toString.call(value) !== '[object Array]')
      return false;

    for (var i = 0; i < expectedValue.length; i++) {
      if (!this.isContained(expectedValue[i], value[i]))
        return false;
    }
  } else if (Object.prototype.toString.call(expectedValue) === '[object Object]') {
    if (Object.prototype.toString.call(value) !== '[object Object]')
      return false;

    for (var property in expectedValue) {
      if (!this.isContained(expectedValue[property], value[property]))
        return false;
    }
  } else if (expectedValue !== value)
    return false;

  return true;
};

/**
 * Validates first level object properties using the given validation description object.
 *
 * It helps validating that an object, coming from a request query string parameters correspond to the expected
 * type, if it has to be required, if it must be contained into a list of values etc.
 *
 * Available features by types :
 *  - **string**
 *    - **default** Specify a default value
 *    - **required** Boolean to indicate if the value is required (if default is specified, value will always be set)
 *    - **in** Specify an array of strings to validate that the value is inside this array
 *  - **number**
 *    - **default** Specify a default value
 *    - **required** Boolean to indicate if the value is required (if default is specified, value will always be set)
 *    - **in** Specify an array of numbers to validate that the value is inside this array
 *    - **gt** Specify a number to validate that the value is greater than this number
 *    - **lt** Specify a number to validate that the value is lesser than this number
 *    - **gte** Specify a number to validate that the value is greater or equal to this number
 *    - **lte** Specify a number to validate that the value is lesser or equal to this number
 *  - **array&lt;string&gt;**
 *    - **required** Boolean to indicate if the value is required (an empty array is not an error)
 *  - **array&lt;number&gt;**
 *    - **required** Boolean to indicate if the value is required (an empty array is not an error)
 *  - **array&lt;object&gt;**
 *    - **required** Boolean to indicate if the value is required (an empty array is not an error)
 *  - **date**
 *    - **required** Boolean to indicate if the value is required
 *    - **gt** Specify a date to validate that the value is greater than this date
 *    - **lt** Specify a date to validate that the value is lesser than this date
 *    - **gte** Specify a date to validate that the value is greater or equal to this date
 *    - **lte** Specify a date to validate that the value is lesser or equal to this date
 *  - **object**
 *    - **default** Specify a default value
 *    - **required** Boolean to indicate if the value is required (if default is specified, value will always be set)
 *  - **boolean**
 *    - **default** Specify a default value
 *    - **required** Boolean to indicate if the value is required (if default is specified, value will always be set)
 *  - **file**
 *    - **required** Boolean to indicate if the value is required
 *    - **in** Specify an array of types to validate that the file's type is inside this array
 *
 * @example
 *
 *     // Get util
 *     var util = require('@openveo/api').util;
 *
 *     // Validate parameters
 *     var params = util.shallowValidateObject({
 *       myStringProperty: 'my value',
 *       myNumberProperty: 25,
 *       myArrayStringProperty: ['value1', 'value2'],
 *       myArrayNumberProperty: [10, 5],
 *       myArrayObjectProperty: [{}, {}],
 *       myDateProperty: '02/25/2016',
 *       myObjectProperty: {firstKey: 'firstValue'},
 *       myBooleanProperty: true,
 *       myFileProperty: 88 13 70 17
 *     }, {
 *       myStringProperty: {type: 'string', required: true, default: 'default', in: ['my value', 'value']},
 *       myNumberProperty: {type: 'number', required: true, default: 0, in: [0, 5, 10], gte: 0, lte: 5},
 *       myArrayStringProperty: {type: 'array<string>', required: true},
 *       myArrayNumberProperty: {type: 'array<number>', required: true},
 *       myArrayObjectProperty: {type: 'array<object>', required: true},
 *       myDateProperty: {type: 'date', required: true, gte: '02/20/2016', lte: '03/30/2016'},
 *       myObjectProperty: {type: 'object', required: true},
 *       myBooleanProperty: {type: 'boolean', required: true},
 *       myFileProperty: {type: 'file', required: true, in: ['JPG', 'PNG', 'GIF']}
 *     });
 *
 *     console.log(params);
 *
 * @method shallowValidateObject
 * @static
 * @param {Object} objectToAnalyze The object to analyze
 * @param {Object} validationDescription The validation description object
 * @return {Object} A new object with the list of properties as expected
 * @throws {Error} An error if a property does not respect its associated rules
 */
module.exports.shallowValidateObject = function(objectToAnalyze, validationDescription) {
  var properties = {};

  // Iterate through the list of expected properties
  for (var name in validationDescription) {
    var expectedProperty = validationDescription[name];
    var value = objectToAnalyze[name];

    if (expectedProperty) {

      // This property was expected

      // Options
      var required = expectedProperty.required || false;
      var inside = expectedProperty.in || null;
      var defaultValue = expectedProperty.default !== undefined ? expectedProperty.default : null;
      var gt = expectedProperty.gt !== undefined ? expectedProperty.gt : null;
      var lt = expectedProperty.lt !== undefined ? expectedProperty.lt : null;
      var gte = expectedProperty.gte !== undefined ? expectedProperty.gte : null;
      var lte = expectedProperty.lte !== undefined ? expectedProperty.lte : null;

      switch (expectedProperty.type) {
        case 'string':
          value = value !== undefined ? String(value) : defaultValue;
          if (inside && inside.indexOf(value) < 0)
            throw new Error('Property ' + name + ' must be one of ' + inside.join(', '));
          break;
        case 'number':
          value = value !== undefined ? parseInt(value) : defaultValue;
          value = isNaN(value) ? defaultValue : value;
          if (gt !== null) gt = parseInt(gt);
          if (lt !== null) lt = parseInt(lt);
          if (gte !== null) gte = parseInt(gte);
          if (lte !== null) lte = parseInt(lte);

          if (value === null) break;

          if (gt !== null && value <= gt)
            throw new Error('Property ' + name + ' must be greater than ' + gt);

          if (lt !== null && value >= lt)
            throw new Error('Property ' + name + ' must be lesser than ' + lt);

          if (gte !== null && value < gte)
            throw new Error('Property ' + name + ' must be greater or equal to ' + gte);

          if (lte !== null && value > lte)
            throw new Error('Property ' + name + ' must be lesser or equal to ' + lte);

          if (inside && inside.indexOf(value) < 0)
            throw new Error('Property ' + name + ' must be one of ' + inside.join(', '));

          break;
        case 'array<string>':
        case 'array<number>':
        case 'array<object>':
          var arrayType = /array<([^>]*)>/.exec(expectedProperty.type)[1];

          if (typeof value === 'string' || typeof value === 'number') {
            value = arrayType === 'string' ? String(value) : parseInt(value);
            value = value ? [value] : null;
          } else if (Object.prototype.toString.call(value) === '[object Array]') {
            var arrayValues = [];
            for (var i = 0; i < value.length; i++) {

              if (arrayType === 'string' || arrayType === 'number') {
                var convertedValue = arrayType === 'string' ? String(value[i]) : parseInt(value[i]);
                if (convertedValue)
                  arrayValues.push(convertedValue);
              }

              if (arrayType === 'object' && Object.prototype.toString.call(value[i]) === '[object Object]')
                arrayValues.push(value[i]);
            }

            value = arrayValues.length ? arrayValues : null;
          } else
            value = null;

          break;
        case 'file':
          if (typeof value === 'string' || (value instanceof Buffer)) {
            var fileBuffer = (value instanceof Buffer) ? value : Buffer.from(value, 'binary');
            var fileMagicNumbers = fileBuffer.toString('hex', 0, 4);
            var fileType = null;

            for (var type in FILE_TYPES) {
              if (fileMagicNumbers === FILE_TYPES[type])
                fileType = type;
            }

            if (!fileType) {
              throw new Error(
                'Property ' + name + ' must be a supported file (' +
                Object.keys(FILE_TYPES).join(', ') + ')'
              );
            }

            if (inside && inside.indexOf(fileType) < 0)
              throw new Error('Property ' + name + ' must be a ' + inside.join('or ') + ' file');

            value = {type: fileType, file: fileBuffer};
            break;
          }

          value = null;
          break;
        case 'date':
          var date;

          if (!value)
            value = null;
          else {
            if (typeof value === 'string') {

              // Convert literal date into Date object
              if (!isNaN(new Date(value).getTime()))
                date = new Date(value).getTime();
              else if (!isNaN(parseInt(value)))
                date = new Date(parseInt(value)).getTime();
              else
                date = null;

            } else if (Object.prototype.toString.call(value) === '[object Date]') {

              // Already a Date object
              date = value.getTime();

            }

            if (date)
              value = date;

            if (gt) {
              var gtDate = typeof gt === 'object' ? gt : new Date(gt);
              if (value <= gtDate.getTime())
                throw new Error('Property ' + name + ' must be greater than ' + gtDate.toString());
            }

            if (lt) {
              var ltDate = typeof lt === 'object' ? lt : new Date(lt);
              if (value >= ltDate.getTime())
                throw new Error('Property ' + name + ' must be lesser than ' + ltDate.toString());
            }

            if (gte) {
              var gteDate = typeof gte === 'object' ? gte : new Date(gte);
              if (value < gteDate.getTime())
                throw new Error('Property ' + name + ' must be greater or equal to ' + gteDate.toString());
            }

            if (lte) {
              var lteDate = typeof lte === 'object' ? lte : new Date(lte);
              if (value > lteDate.getTime())
                throw new Error('Property ' + name + ' must be lesser or equal to ' + lteDate.toString());
            }
          }
          break;
        case 'object':
          var valueType = Object.prototype.toString.call(value);
          value = value !== undefined && valueType ? value : defaultValue;
          break;
        case 'boolean':
          value = (value === undefined || value === null) ? defaultValue : Boolean(value);
          break;
        default:
          value = null;
      }

      if (required && (value === null || typeof value === 'undefined'))
        throw new Error('Property ' + name + ' required');
      else if (value !== null && typeof value !== 'undefined')
        properties[name] = value;

    }

  }

  return properties;
};
