'use strict';

/* Controllers */

var wmoTests = angular.module('wmoTests', []);


wmoTests.controller('TestsCtrl', ['$scope',
  function($scope) {
    $scope.tests = [
      { name: 'setLang',
        template: $TESTS + 'setlang.html',
      },
      {
        name: 'Enroll',
        template: $TESTS + 'enroll.html',
      },
      {
        name: 'Login',
        template: $TESTS + 'login.html',
      },
      {
        name: 'Create User',
        template: $TESTS + 'createuser.html',
      }
    ];
    $scope.selectAll = function(){
      angular.forEach($scope.tests, function(test){
        test.selected = $scope.allSelected;
      })
    };
  }]);

