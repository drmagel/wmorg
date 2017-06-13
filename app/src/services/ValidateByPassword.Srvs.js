wmoServices.factory('ValidateByPassword', ['$uibModal',
  function($uibModal){
    var self = this;
    
    self.factory = {
      validate: function(headerStr, cancelStr, fnOK, fnCancel){ // Header-string, Cancel-string, OK-callback, Cancel-callback
        var fnOK = fnOK || function(){}
          , fnCancel = fnCancel || function(){}
          , modal = $uibModal.open({
              animation: true,
              keyboard: true,
              backdrop: 'static', //'true' 'false', or 'static'
              templateUrl: $TMPL + 'validateByPassword.html',
              controller: 'ModalValidateByPasswordCtrl',
              size: 'sm', //'sm' - small; 'md' - medium; 'lg' - large
              resolve: {
                modalHeader: function(){
                  return headerStr || 'sessionExpired';
                },
                modalCancel: function(){
                  return cancelStr || 'cancel';
                }
              }
            })
          ;
        modal.result.then(
          function(){fnOK()}, // 'fnOK' - run callback;
          function(){fnCancel()}// 'fnCancel' - run callback
        );
      },
      response: function(statusStr, headerStr, fnOK){ // Status-string: 'success' or 'failure', Header-string, OK-callback
        var fnOK = fnOK || function(){}
          , statusStr = statusStr || 'success'
          , headerStr = headerStr || 'operationSuccess'
          , modal = $uibModal.open({
              animation: true,
              keyboard: true,
              backdrop: 'static', //'true' 'false', or 'static'
              templateUrl: $TMPL + 'operationResponse.html',
              controller: 'ModalOperationResponseCtrl',
              size: 'sm', //'sm' - small; 'md' - medium; 'lg' - large
              resolve: {
                modalHeader: function(){
                  return headerStr;
                },
                modalStatus: function(){
                  return statusStr;
                }
              }
            })
          ;
        modal.result.then(
          function(){fnOK()}, // 'fnOK' - run callback;
          function(){fnOK()}
        );
      }      
    };   
    return self.factory;
  }]);

