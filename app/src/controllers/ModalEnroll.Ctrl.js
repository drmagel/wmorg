wmoControllers.controller('ModalEnrollCtrl', ['$scope', '$rootScope', '$uibModalInstance', 'validNumber', 'validString', 'validEmail',
  function($scope, $rootScope, $uibModalInstance, validNumber, validString, validEmail) {
    $scope.validNumber = validNumber;
    $scope.validString = validString;
    $scope.validEmail  = validEmail;
    $scope.input = {};

    $scope.validateNumber = function(){
      return $scope.validNumber === $scope.input.verNumber;
    };
    
    $scope.validateString = function(){
      return $scope.validString === $scope.input.verString;
    };
    
    $scope.disabled = function() {
      return !!!($scope.validateString() && $scope.validateString());
    };    
    $scope.register = function() {
      $uibModalInstance.close($scope.validEmail);
    };
    $scope.cancel = function() {
      $uibModalInstance.dismiss('canceled');
    };
  }]);

