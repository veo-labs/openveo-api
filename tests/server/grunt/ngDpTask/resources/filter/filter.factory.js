'use strict';

function factory($filter) {
  $filter('filter')('test');
}
angular.module('module').factory('factory1', factory);
factory.$inject = ['$filter'];
