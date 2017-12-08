'use strict';

angular.module('module').config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/', {
    controller: 'controller',
    resolve: {
      resolve1: ['factory', function() {}]
    }
  });
}]);
