'use strict';

function factory2() {

}
angular.module('module').factory('factory2', factory2);
factory2.$inject = ['factory1'];
