'use strict';

/* App Module */

var wwmmorg = angular.module('wwmmorg', [
  'ui.bootstrap',
  'ngRoute',
  'wmoControllers',
  'wmoTests',
  'wmoServices'
]);

//wwmmorg.config(['$locationProvider',
//  function($locationProvider) {
//    $locationProvider.hashPrefix('!');
//}]);

wwmmorg.config(['$routeProvider',
  function($routeProvider) {
    $routeProvider
      .when('/', {
        redirectTo: 'logout'
      })
      .when('/logout', {
        template: "<div ng-controller='LogoutCtrl' ng-cloak></div>",
        controler: 'LogoutCtrl'
      })
      .when('/login', {
        templateUrl: $TMPL + 'login.html',
        controler: 'LoginCtrl'
      })
      .when('/register/:step', {
        templateUrl: $TMPL + 'register.html',
        validationReqired: true
      })
      .when('/users/:userid/:sessid', {
        templateUrl: $TMPL + 'userhome.html',
        loginRequired: true
      })
      .when('/tests', {
        templateUrl: $TMPL + 'tests.html',
        controler: 'TestsCtrl'
      })
      .when('/gotLost', {
        template: "<h1>Hi, you've got lost...</h1>"
      })
      .when('/bootstrap', {
        templateUrl: $TMPL + 'bootstrap-test.html'
      })
      .otherwise({
        redirectTo: '/gotLost'
      });
  }]);

wwmmorg.run(['$location','$rootScope','$anchorScroll','Account','Registration',
  function($location, $rootScope, $anchorScroll, Account, Registration){
   $rootScope.$on('$routeChangeStart', function(event, nextRoute, currentRoute){
   // Login section
   //if login required and you're logged out, capture the current path
     if(nextRoute.loginRequired && Account.loggedOut()){
       console.log('RUN:$routeChangeStart:Login:Account.loggedOut: ' + Account.loggedOut() + '; nextRoute.loginRequired: ' + nextRoute.loginRequired);
       $location.path('/login').replace();
     }
   });
   // Registration
   $rootScope.$on('$routeChangeStart', function(event, nextRoute, currentRoute){
     if(nextRoute.validationReqired && Registration.mailDenied()){
       console.log('RUN:$routeChangeSuccess:Registration:mailDenied: ' + Registration.mailDenied());
       $location.path('/login').replace();
     }
   });
  
   // Tempaltes section
   // Plan Properties Template.
   $rootScope.planPropertiesTmpl = $UHTMPL + 'PlanProperties.html';

   // To scroll to a subsection using anchors. 
   // usage: href="" ng-click="scrollTo('my_id')"
   $rootScope.scrollTo = function(id){
     $location.hash(id);
     $anchorScroll();
   };  
  }]);
    
