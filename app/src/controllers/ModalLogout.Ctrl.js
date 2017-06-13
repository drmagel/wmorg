wmoControllers.controller('ModalLogoutCtrl', ['$scope', '$uibModalInstance',
  function($scope, $uibModalInstance) {
    $scope.logout = function(){
      $uibModalInstance.close('logout');
    };
    $scope.cancel = function(){
      $uibModalInstance.dismiss('canceled');
    };
  }]);
    
