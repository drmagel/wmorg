wmoControllers.controller('ModalOperationResponseCtrl', ['$scope', '$uibModalInstance', 'modalHeader', 'modalStatus',
  function($scope, $uibModalInstance, modalHeader, modalStatus) {
    $scope.operModal = {title: modalHeader};
    switch(modalStatus){
      case 'success':
        $scope.operModal.glyphicon = 'glyphicon-ok-circle';
        $scope.operModal.alert = 'alert-success';
      break;
      case 'failure':
        $scope.operModal.glyphicon = 'glyphicon-ban-circle';
        $scope.operModal.alert = 'alert-danger';
      break;
      default:;
    };

    
// $uibModalInstance
    $scope.close = function(){
      $uibModalInstance.close('confirmed');
    };
    $scope.cancel = function(){
      $uibModalInstance.dismiss('canceled');
    };
  }]);

