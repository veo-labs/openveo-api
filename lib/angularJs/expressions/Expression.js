'use strict';

/**
 * @module angularJs/expressions/Expression
 * @ignore
 */

/**
 * An AngularJS JavaScript definition expression.
 *
 * See Expression.ELEMENTS for supported AngularJS elements.
 * AngularJS JavaScript definition expressions could be:
 *   - angular.module('moduleName').component()
 *   - angular.module('moduleName').directive()
 *   - angular.module('moduleName').controller()
 *   - angular.module('moduleName').factory()
 *   - angular.module('moduleName').service()
 *   - angular.module('moduleName').constant()
 *   - angular.module('moduleName').service()
 *   - angular.module('moduleName').decorator()
 *   - angular.module('moduleName').filter()
 *   - angular.module('moduleName', [])
 *
 * @class Expression
 * @constructor
 * @ignore
 * @param {Object} expression The element call expression as returned by esprima
 */
function Expression(expression) {
  Object.defineProperties(this,

    /** @lends module:angularJs/expressions/Expression~Expression */
    {

      /**
       * The element expression as returned by esprima.
       *
       * @type Object
       * @instance
       * @readonly
       */
      expression: {value: expression}

    }

  );
}

module.exports = Expression;

/**
 * Validates that the expression is as expected regarding the expression type.
 *
 * @return {Boolean} true, sub classes may override it
 */
Expression.prototype.isValid = function() {
  return true;
};
