wmoControllers.controller('LoginCtrl', ['$window', '$scope', '$location', 'Login',
  function($window, $scope, $location, Login) {
    var submitUrl = $USERS;
    
    $scope.login = function(email, password) {      
      Login.get({email: email, password: password}, function(res){
        if(!!res.result) {
          $window.sessionStorage.setItem('sessID', res.sessID);
          $window.sessionStorage.setItem('userID', res.userID);
          $window.sessionStorage.setItem('email',  email);
          submitUrl = submitUrl + res.userID + '/' + res.sessID;
          $location.path(submitUrl).replace();
        }
//console.log(res);        
        return $scope.response = res;
      });
    };
    
    $scope.showAlert = function(){
      if(($scope.response || {}).reason === undefined) {return false};
      if(!!$scope.response.reason){$scope.inputChanged = false;}
      return !!$scope.response.reason;
    };
    $scope.dismissAlert = function(){
      delete $scope.password;
      return $scope.response.reason = false;
    };
    $scope.alertMessage = function(){
      return ($scope.response || {}).reason || 'no_reason';
    };
    $scope.changed = function(){
      return $scope.inputChanged = true;
    };
    $scope.disabled = function() {
      return !!!(!!$scope.email && !!$scope.password && !!$scope.inputChanged);
    };
  }]);

