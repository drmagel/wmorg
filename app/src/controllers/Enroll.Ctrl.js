wmoControllers.controller('EnrollCtrl', ['$window', '$scope', '$rootScope', '$uibModal', '$location', 'Enroll',
  function($window, $scope, $rootScope, $uibModal, $location, Enroll) {
    $scope.enroll = function(email) {
      var lang = $window.sessionStorage.getItem('lang') || 'eng';
      Enroll.get({email: email, lang: lang}, function(res){
        if(!!res.result) {
          $scope.number = res.number;
          $scope.string = res.string;
          $scope.openModal();
        }
//console.log(res);        
          return $scope.response = res;
      });
    };

    $scope.openModal = function() {
      var modal = $uibModal.open({
        animation: true,
        keyboard: true,
        backdrop: 'static', //'true' 'false', or 'static'
        templateUrl: $TMPL + 'enroll.html',
        controller: 'ModalEnrollCtrl',
        size: 'md', //'sm' - small; 'md' - medium; 'lg' - large
        resolve: {
          validNumber: function(){
            return $scope.number;
          },
          validString: function(){
            return $scope.string;
          },
          validEmail: function(){
            return $scope.email;
          }
        }
      });
      modal.result.then(
        function(email){
          $window.sessionStorage.setItem('email', email);
          $location.path($REGISTER + $START).replace(); //redirection to register.html
        },
        function(){
          $window.sessionStorage.setItem('email', '');
        }
      );
    };

    $scope.showAlert = function(){
      if(($scope.response || {}).reason === undefined) {return false};
      if(!!$scope.response.reason){$scope.inputChanged = false;}
      return !!$scope.response.reason;
    };
    $scope.dissmissAlert = function(){
      delete $scope.email;
      return $scope.response.reason = false;
    };
    $scope.alertMessage = function(){
      return (($scope.response || {}).reason) || 'no_reason';
    };
    $scope.changed = function(){
      return $scope.inputChanged = true;
    };
    $scope.disabled = function() {
      return !(!!$scope.email && !!$scope.inputChanged);
    };
    
  }]);

