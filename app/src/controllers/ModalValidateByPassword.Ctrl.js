wmoControllers.controller('ModalValidateByPasswordCtrl', ['$window', '$scope', '$uibModalInstance', 'Validate', 'modalHeader', 'modalCancel',
  function($window, $scope, $uibModalInstance, Validate, modalHeader, modalCancel) {
    $scope.modalHeader = modalHeader;
    $scope.modalCancel   = modalCancel;

// passwdValidateRE = /(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[-=!@#$%+]).{6,}/ - from the globals.js file
    var validatePasswd = function(){
          return passwdValidateRE.test($scope.data.password);
        }
      , response = {}
      , inputChanged = true
      , email  = $window.sessionStorage.getItem('email')
      , sessID = $window.sessionStorage.getItem('sessID')
      ;
    $scope.data = {email: email, sessID: sessID};

// Check Password    
    $scope.showAlert = function(){
      if(response.reason === undefined) {return false};
      if(!!response.reason){inputChanged = false;}
      return !!response.reason;
    };
    $scope.dissmissAlert = function(){
      delete $scope.data.password;
      return response.reason = false;
    };
    $scope.alertMessage = function(){
      response.reason === 'invalid_credentials' && (response.reason = 'wrong_password');
      return response.reason || 'no_reason';
    };
    $scope.changed = function(){
      return inputChanged = true;
    };
    $scope.disabled = function(){
      return !!!(validatePasswd() && inputChanged);
    };
    
// Confirm by password - $uibModalInstance
    $scope.confirm = function(){
      Validate.get($scope.data, function(res){
        if(!!res.result){
          $uibModalInstance.close('confirmed');
        }
        return response = res;
      })
    };
    $scope.cancel = function(){
      $uibModalInstance.dismiss('canceled');
    };
  }]);

