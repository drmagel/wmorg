wmoControllers.controller('LogoutCtrl', ['$window', '$location', '$rootScope', 'Logout',
  function($window, $location, $rootScope, Logout) {
    var sessID = $window.sessionStorage.getItem('sessID');
    Logout.get({sessID: sessID}, function(res){
//    $window.sessionStorage.clear(); // Completely clearing the sessionStorage
      $window.sessionStorage.setItem('sessID', '');
      $window.sessionStorage.setItem('userID', '');
      $window.sessionStorage.setItem('email',  '');
      delete $rootScope.user;
      $location.path($LOGIN).replace();      
    });
  }]);
  