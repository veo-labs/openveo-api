'use strict';

var ElementExpression = process.requireApi('lib/grunt/ngDpTask/ElementExpression.js');
var ComponentExpression = process.requireApi('lib/grunt/ngDpTask/ComponentExpression.js');
var DirectiveExpression = process.requireApi('lib/grunt/ngDpTask/DirectiveExpression.js');
var ModuleExpression = process.requireApi('lib/grunt/ngDpTask/ModuleExpression.js');
var ValueExpression = process.requireApi('lib/grunt/ngDpTask/ValueExpression.js');
var ConstantExpression = process.requireApi('lib/grunt/ngDpTask/ConstantExpression.js');

/**
 * Defines a factory to get an instance of an expression.
 *
 * @class factory
 * @static
 */

/**
 * Gets an instance of an Expression.
 *
 * @method get
 * @static
 * @param {String} name The AngularJS element name (see Expression.ELEMENTS)
 * @param {Object} expression The definition expression as returned by esprima
 * @return {Expression} The definition expression
 * @throws {TypeError} If expression type is unknown
 */
module.exports.getElementExpression = function(name, expression) {
  if (name && expression) {
    switch (name) {

      case ElementExpression.ELEMENTS.COMPONENT:
        return new ComponentExpression(expression);

      case ElementExpression.ELEMENTS.MODULE:
        return new ModuleExpression(expression);

      case ElementExpression.ELEMENTS.DIRECTIVE:
        return new DirectiveExpression(expression);

      case ElementExpression.ELEMENTS.VALUE:
        return new ValueExpression(expression);

      case ElementExpression.ELEMENTS.CONSTANT:
        return new ConstantExpression(expression);

      default:
        if (Object.values(ElementExpression.ELEMENTS).indexOf(name) > -1)
          return new ElementExpression(expression);
        else
          throw new TypeError('Unknown definition expression type "' + name + '"');
    }
  } else
    throw new TypeError('Invalid expression definition');
};
