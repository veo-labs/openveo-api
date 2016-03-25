'use strict';

var util = require('util');

/**
 * Provides functions for common JavaScript operations.
 *
 * @example
 *
 *     // Get util
 *     var util = require('@openveo/api').util;
 *
 * @module util
 * @class util
 * @main util
 */

/**
 * Merges, recursively, all properties of object2 in object1.
 *
 * This will not create copies of objects.
 *
 * @method merge
 * @param {Object} object1 The JavaScript final object
 * @param {Object} object2 A second JavaScript object to merge into
 * the first one
 * @return {Object} object1
 */
module.exports.merge = function(object1, object2) {
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
 * Merges two arrays without any duplicated value.
 *
 * @method joinArray
 * @param {Array} [array1] A JavaScript array
 * @param {Array} [array2] A JavaScript array
 * @return {Array} array
 */
module.exports.joinArray = function(array1, array2) {
  return array1.concat(array2.filter(function(item) {
    return array1.indexOf(item) < 0;
  }));
};


/**
 * Checks if an email address is valid or not.
 *
 * @method isEmailValid
 * @param {String} email The email address
 * @return {Boolean} true if the email is valid, false otherwise
 */
module.exports.isEmailValid = function(email) {
  var reg = new RegExp('[a-z0-9!#$%&\'*+\/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&\'*+\/=?^_`{|}~-]+)*@(?:[a-z0-9]' +
                       '(?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?');
  return reg.test(email);
};

/**
 * Validates first level object properties using the given validation description object.
 *
 * It helps validating that an object, coming from a request query string parameters correspond to the expected
 * type, if is has to be required, if it must be contained into a list of values etc.
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
 *       myArrayStringProperty: ['value1', 'value2']
 *       myArrayNumberProperty: [10, 5]
 *       myDateProperty: '02/25/2016'
 *       myObjectProperty: {firstKey: 'firstValue'}
 *     }, {
 *       myStringProperty: {type: 'string', required: true, defaultValue: 'default', in: ['my value', 'value']},
 *       myNumberProperty: {type: 'number', required: true, defaultValue: 0, in: [0, 5, 10], gte: 0, lte: 5},
 *       myArrayStringProperty: {type: 'array<string>', required: true},
 *       myArrayNumberProperty: {type: 'array<number>', required: true},
 *       myDateProperty: {type: 'date', required: true, gte: '02/20/2016', lte: '03/30/2016'}
 *       myObjectProperty: {type: 'object', required: true}
 *     });
 *
 *     console.log(params);
 *
 * @method shallowValidateObject
 * @param {Object} objectToAnalyze The object to analyze
 * @param {Object} validationDescription The validation description object
 * @return {Object} A new object with the list of properties as expected
 */
module.exports.shallowValidateObject = function(objectToAnalyze, validationDescription) {
  var dateFormat = /(\d{2})[-\/](\d{2})[-\/](\d{4})/;
  var properties = {};

  // Iterate through the list of expected properties
  for (var name in validationDescription) {
    var expectedProperty = validationDescription[name];
    var value = objectToAnalyze[name];

    if (expectedProperty) {

      // This property was expected

      // Options
      var defaultValue = expectedProperty.default || null;
      var required = expectedProperty.required || false;
      var inside = expectedProperty.in || null;
      var gt = expectedProperty.gt || null;
      var lt = expectedProperty.lt || null;
      var gte = expectedProperty.gte || null;
      var lte = expectedProperty.lte || null;

      switch (expectedProperty.type) {
        case 'string':
          value = value !== undefined ? String(value) : defaultValue;
          if (inside && inside.indexOf(value) < 0)
            throw new Error('Property ' + name + ' must be one of ' + inside.join(', '));
          break;
        case 'number':
          value = value !== undefined ? parseInt(value) : defaultValue;
          value = value || defaultValue || null;

          if (gt && value <= gt)
            throw new Error('Property ' + name + ' must be greater than ' + gt);

          if (lt && value >= lt)
            throw new Error('Property ' + name + ' must be lesser than ' + lt);

          if (gte && value < gte)
            throw new Error('Property ' + name + ' must be greater or equal to ' + gte);

          if (lte && value > lte)
            throw new Error('Property ' + name + ' must be lesser or equal to ' + lte);

          if (inside && inside.indexOf(value) < 0)
            throw new Error('Property ' + name + ' must be one of ' + inside.join(', '));

          break;
        case 'array<string>':
        case 'array<number>':
          var arrayType = /array<([^>]*)>/.exec(expectedProperty.type)[1];

          if (typeof value === 'string' || typeof value === 'number') {
            value = arrayType === 'string' ? String(value) : parseInt(value);
            value = value ? [value] : null;
          } else if (Object.prototype.toString.call(value) === '[object Array]') {
            var arrayValues = [];
            for (var i = 0; i < value.length; i++) {
              var convertedValue = arrayType === 'string' ? String(value[i]) : parseInt(value[i]);
              if (convertedValue)
                arrayValues.push(convertedValue);
            }

            value = arrayValues.length ? arrayValues : null;
          } else
            value = null;

          break;

        case 'date':
          var date;

          if (!value)
            value = null;
          else {
            if (typeof value === 'string') {

              // Convert literal date into Date object
              var dateChunks = dateFormat.exec(value);
              if (dateChunks && dateChunks.length === 4)
                date = new Date(value).getTime();
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
        default:
          value = null;
      }

      if (required && (value === null || typeof value === 'undefined'))
        throw new Error('Property ' + name + ' required');

      properties[name] = value;
    }

  }

  return properties;
};
