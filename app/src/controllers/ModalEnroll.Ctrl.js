wmoControllers.controller('ModalEnrollCtrl', ['$scope', '$rootScope', '$uibModalInstance', 'Enroll', 'Email',
  function($scope, $rootScope, $uibModalInstance, Enroll, Email) {
//    $scope.resNumber = resNumber;
//    $scope.resString = resString;
//    $scope.resEmail  = Email;
    var email = Email
      , hideInput = false
      ;
    $scope.input = {verNumber: '',
                    verString: '',
                    verNumberClass: '',
                    verStringClass: ''
                   };

    $scope.validateNumber = function(){
      return $scope.input.verNumber.match(/^[0-9]{8}$/);
    };    
    $scope.validateString = function(){
      return $scope.input.verString.match(/^[a-z]{8}$/);
    };    
    $scope.disabled = function() {
      return !!!($scope.validateString() && $scope.validateString() && !!!$scope.hideInput);
    };
    $scope.showAlert = function(){
      return hideInput;
    };
    $scope.dismissAlert = function(){
      hideInput = false;
      $scope.input.verNumber = '';
      $scope.input.verString = '';
      $scope.input.verNumberClass = '';
      $scope.input.verStringClass = '';
    };
    $scope.register = function() {
      Enroll.reassert({email: email, number: $scope.input.verNumber, string: $scope.input.verString}, function(res){
        if(!!res.result){
          $uibModalInstance.close(email);        
        } else {
          hideInput = true;
        }
      })
    };
    $scope.cancel = function() {
      $uibModalInstance.dismiss('canceled');
    };
  }]);

