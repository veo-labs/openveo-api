'use strict';

var path = require('path');
var async = require('async');
var he = require('he');
var fileSystem = process.requireApi('lib/fileSystem.js');

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
      if (typeof object2[property] === 'object' && !Array.isArray(object2[property]) && object2[property] !== null) {
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
  var intersectedArray = [];

  return array2.filter(function(item) {
    if (array1.indexOf(item) >= 0 && intersectedArray.indexOf(item) === -1) {
      intersectedArray.push(item);
      return true;
    }
    return false;
  });
};

/**
 * Compares two arrays.
 *
 * Shallow validates that two arrays contains the same elements, no more no less.
 *
 * @method areSameArrays
 * @static
 * @param {Array} [array1] An array
 * @param {Array} [array2] An array
 * @return {Boolean} true if arrays are the same, false otherwise
 */
module.exports.areSameArrays = function(array1, array2) {
  if (array1.length === array2.length && this.intersectArray(array1, array2).length === array1.length)
    return true;
  else
    return false;
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
  var reg = new RegExp('[a-z0-9!#$%&\'*+/=?^_`{|}~-]+(?:.[a-z0-9!#$%&\'*+/=?^_`{|}~-]+)*@(?:[a-z0-9]' +
                       '(?:[a-z0-9-]*[a-z0-9])?.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?');
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
 *    - **in** Specify an array of values to validate that each value of the array is inside this array
 *  - **array&lt;number&gt;**
 *    - **required** Boolean to indicate if the value is required (an empty array is not an error)
 *    - **in** Specify an array of values to validate that each value of the array is inside this array
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
 *     var fileSystem = require('@openveo/api').fileSystem;
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
 *       myFileProperty: 88 13 70 17 // At least the first 300 bytes of the file
 *     }, {
 *       myStringProperty: {type: 'string', required: true, default: 'default', in: ['my value', 'value']},
 *       myNumberProperty: {type: 'number', required: true, default: 0, in: [0, 5, 10], gte: 0, lte: 5},
 *       myArrayStringProperty: {type: 'array<string>', required: true, in: ['value1', 'value2']},
 *       myArrayNumberProperty: {type: 'array<number>', required: true, in: [42, 43]},
 *       myArrayObjectProperty: {type: 'array<object>', required: true},
 *       myDateProperty: {type: 'date', required: true, gte: '02/20/2016', lte: '03/30/2016'},
 *       myObjectProperty: {type: 'object', required: true},
 *       myBooleanProperty: {type: 'boolean', required: true},
 *       myFileProperty: {type: 'file', required: true, in: [
 *         fileSystem.FILE_TYPES.JPG,
 *         fileSystem.FILE_TYPES.PNG,
 *         fileSystem.FILE_TYPES.GIF,
 *         fileSystem.FILE_TYPES.MP4,
 *         fileSystem.FILE_TYPES.TAR
 *       ]}
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

          if ((typeof value === 'string' || typeof value === 'number') && arrayType !== 'object') {
            value = arrayType === 'string' ? String(value) : parseInt(value);
            value = value ? [value] : null;
          } else if (Object.prototype.toString.call(value) === '[object Array]') {
            var arrayValues = [];
            for (var i = 0; i < value.length; i++) {

              if (arrayType === 'string' || arrayType === 'number') {
                var convertedValue = arrayType === 'string' ? String(value[i]) : parseInt(value[i]);
                if (convertedValue) {

                  if (inside && inside.indexOf(convertedValue) < 0)
                    throw new Error('Property ' + name + ' has a value (' + convertedValue +
                                    ') which is not part of ' + inside.join('or '));

                  arrayValues.push(convertedValue);
                }
              }

              if (arrayType === 'object' && Object.prototype.toString.call(value[i]) === '[object Object]')
                arrayValues.push(value[i]);
            }

            value = arrayValues.length ? arrayValues : null;
          } else if (typeof value !== 'undefined')
            throw new Error('Property ' + name + ' must be a "' + expectedProperty.type + '"');
          else
            value = null;

          break;
        case 'file':
          if (typeof value === 'string' || (value instanceof Buffer)) {
            var fileBuffer = (value instanceof Buffer) ? value : Buffer.from(value, 'binary');
            var fileType = fileSystem.getFileTypeFromBuffer(fileBuffer);

            if (!fileType) {
              throw new Error(
                'Property ' + name + ' must be a supported file (' +
                Object.keys(fileSystem.FILE_TYPES).join(', ') + ')'
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
          if (!value)
            value = null;
          else {
            if (!isNaN(new Date(value).getTime()))
              value = new Date(value).getTime();
            else if (!isNaN(parseInt(value)))
              value = new Date(parseInt(value)).getTime();
            else
              value = null;

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

/**
 * Validates that files are in the expected type.
 *
 * Available features for validation object:
 *  - **in** Specify an array of types to validate that the file type is inside this array
 *
 * @example
 *
 *     // Get util
 *     var util = require('@openveo/api').util;
 *     var fileSystem = require('@openveo/api').fileSystem;
 *
 *     // Validate parameters
 *     var params = util.validateFiles({
 *       myFirstFile: '/tmp/myFirstFile.mp4',
 *       mySecondFile: '/tmp/mySecondFile.tar'
 *     }, {
 *       myFirstFile: {in: [fileSystem.FILE_TYPES.MP4]},
 *       mySecondFile: {in: [fileSystem.FILE_TYPES.TAR]}
 *     }, function(error, files) {
 *       if (error) {
 *         console.log('An error occurred during validation with message: ' + error.message);
 *       }
 *
 *       console.log('Is file valid ? ' + files.myFirstFile.isValid);
 *       console.log('File type: ' + files.myFirstFile.type);
 *     });
 *
 *     console.log(params);
 *
 * @method validateFiles
 * @static
 * @async
 * @param {Object} filesToAnalyze Files to validate with keys as files identifiers and values as
 * files absolute paths
 * @param {Object} validationDescription The validation description object with keys as files identifiers
 * and values as validation objects
 * @param {Function} callback The function to call when done
 *   - **Error** The error if an error occurred, null otherwise
 *   - **Object** Files with keys as the files identifiers and values as Objects containing validation
 *     information: isValid and type (from util.FILE_TYPES)
 */
module.exports.validateFiles = function(filesToAnalyze, validationDescription, callback) {
  var files = {};
  var asyncFunctions = [];

  var getAsyncFunction = function(id, filePath) {
    return function(callback) {
      fileSystem.readFile(filePath, 0, 300, function(error, buffer) {
        if (error) return callback(error);

        var pathDescriptor = path.parse(filePath);
        var fileType = fileSystem.getFileTypeFromBuffer(buffer);
        files[id] = {isValid: false, type: fileType};

        if (validationDescription[id].in.indexOf(files[id].type) > -1 &&
           (!validationDescription[id].validateExtension || pathDescriptor.ext.toLowerCase() === '.' + fileType))
          files[id].isValid = true;

        callback();
      });
    };
  };

  for (var id in filesToAnalyze) {
    if (filesToAnalyze[id] && validationDescription && validationDescription[id])
      asyncFunctions.push(getAsyncFunction(id, filesToAnalyze[id]));
  }

  if (!asyncFunctions.length)
    return callback(new Error('No files to analyze'));

  async.parallel(asyncFunctions, function(error) {
    if (error) return callback(error);
    callback(null, files);
  });
};

/**
 * Gets values of a specific property from a structured Array and its sub Array(s).
 *
 * @example
 *
 *     // Get util
 *     var util = require('@openveo/api').util;
 *
 *     // Get values of property "id" for each Array and sub Array(s) items
 *     var params = util.getPropertyFromArray('id', [
 *       {id: 0},
 *       {id: 1},
 *       {id: 2, items: [{id: 3}]}
 *     ], 'items');
 *
 *     // [0, 1, 2, 3]
 *     console.log(params);
 *
 * @example
 *
 *     // Get util
 *     var util = require('@openveo/api').util;
 *
 *     // Get values of property "id" for each Array and sub Array(s) items starting at the item where "id" equal 2
 *     var params = util.getPropertyFromArray('id', [
 *       {id: 0},
 *       {id: 1},
 *       {id: 2, items: [
 *           {id: 3, items: [{id: 4}]}
 *         ]
 *       }
 *     ], 'items', 2);
 *
 *     // [3, 4]
 *     console.log(params);
 *
 * @method getPropertyFromArray
 * @static
 * @param {String} property The name of the property to fetch
 * @param {Array} list The list of objects to look into
 * @param {String} [recursiveProperty] The name of the recursive property to look into
 * @param {Mixed} [startValue] The value of the searched property to start collecting values from
 * @param {Boolean} [shouldGetNextItems] For internal use, it indicates if the values must be collected or not, for the
 * given list. If true all values of the Array and sub Array(s) will be collected
 * @return {Array} The list of values for the given property in the Array and its sub Array(s)
 */
module.exports.getPropertyFromArray = function(property, list, recursiveProperty, startValue, shouldGetNextItems) {
  var self = this;
  var values = [];

  if (!list || !list.length || !property)
    return values;

  list.forEach(function(item) {
    var shouldGetSubItems = shouldGetNextItems;

    if (!startValue || shouldGetNextItems)
      values.push(item[property]);

    if (recursiveProperty && item[recursiveProperty] && item[property] === startValue)
      shouldGetSubItems = true;

    if (recursiveProperty && item[recursiveProperty]) {
      values = values.concat(
        self.getPropertyFromArray(property, item[recursiveProperty], recursiveProperty, startValue, shouldGetSubItems)
      );
    }
  });

  return values;
};

/**
 * Evaluates a path of properties on an object.
 *
 * It does not use the JavaScript eval function.
 *
 * @example
 *
 *     // Get util
 *     var util = require('@openveo/api').util;
 *
 *     // Get property 'my.deep.property' of the object
 *     var value = util.evaluateDeepObjectProperties('my.deep.property', {
 *       my {
 *         deep {
 *           property: 'My deep property value'
 *         }
 *       }
 *     });
 *
 *     // "My deep property value"
 *     console.log(value);
 *
 * @method evaluateDeepObjectProperties
 * @static
 * @param {String} propertyPath The path of the property to retreive from the object
 * @param {Object} objectToAnalyze The object containing the requested property
 * @return {Mixed} The value of the property
 */
module.exports.evaluateDeepObjectProperties = function(propertyPath, objectToAnalyze) {
  if (!propertyPath) return null;

  var propertyNames = propertyPath.split('.');
  var value = objectToAnalyze;

  for (var i = 0; i < propertyNames.length; i++) {
    if (!value[propertyNames[i]]) return null;
    value = value[propertyNames[i]];
  }

  return value;
};

/**
 * Escapes a text that will be used in a regular expression.
 *
 * @example
 *
 *     // Get util
 *     var util = require('@openveo/api').util;
 *
 *     var escapedText = util.escapeTextForRegExp(
 *       'Text with characters interpreted by JavaScript regular expressions: [](){}?*+.^$/\\|'
 *     );
 *
 *     // "Text with characters interpreted by JavaScript regular expressions:
 *     // \\[\\]\\(\\)\\{\\}\\?\\*\\+\\.\\^\\$\/\\\|"
 *     console.log(escapedText);
 *
 * @method escapeTextForRegExp
 * @static
 * @param {String} text The text to escape
 * @return {String} The escaped text
 */
module.exports.escapeTextForRegExp = function(text) {
  return text.replace(/(\*|\[|\]|\{|\}|\(|\)|\.|\?|\/|\+|\\|\^|\$|\|)/g, '\\$1');
};

/**
 * Decodes all HTML entities and removes all HTML elements from specified text.
 *
 * New lines are also replaced by spaces.
 *
 * @example
 *
 *     // Get util
 *     var util = require('@openveo/api').util;
 *
 *     var htmlLessText = util.removeHtmlFromText(
 *       'Text with <strong style="color: orange">HTML tags</strong> and HTML entities like "&eacute; or $ccedil;" +
 *       '\n on several lines'
 *     );
 *
 *     // 'Text with HTML tags and HTML entities like "é or ç"  on several lines'
 *     console.log(htmlLessText);
 *
 * @method removeHtmlFromText
 * @static
 * @param {String} text The text to sanitize
 * @return {String} The sanitized text
 */
module.exports.removeHtmlFromText = function(text) {

  // Use he library to decode text as it might contain HTML entities
  text = he.decode(text);

  // Remove any HTML tag (<\/?[^>]*>), carriage return (\n|\r\n) and non-breaking space (\u00a0) from the text
  // HTML tags and entities are removed while new lines and non-breaking spaces are replaced by spaces
  return text.replace(/(<\/?[^>]*>)|(\n)|(\r\n)|(\u00a0)/gi, function(
    match,
    tag,
    newLine,
    newLine2,
    nonBreakingSpace
  ) {
    if (tag) return '';
    if (newLine || newLine2 || nonBreakingSpace) return ' ';
  }).replace(/ +/gi, ' ').trim();

};
