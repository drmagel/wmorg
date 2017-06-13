wmoControllers.controller('CreatePlanCtrl', ['$window', '$location', '$scope', '$rootScope',
                                             'Calendar', 'OperatePlan', 'ValidateByPassword',
  function($window, $location, $scope, $rootScope, Calendar, OperatePlan, ValidateByPassword) {
    $scope.plan = {description:{}}; // Obligated for PlanPropertiesCtrl controller.

    $scope.newPlans = [];    
    $scope.disableEditing = true;
    $scope.dateFormat = $PLANPROPERTIES.planDateFormat;
    
    var userID = $window.sessionStorage.getItem('userID') || ''
      , sessID = $window.sessionStorage.getItem('sessID') || ''
      ;

    $scope.localTime = function(time){
      return Calendar.local(time);
    };
    $scope.cleanPlan = function(){
      $scope.plan = {description:{}};     
      $scope.planPropertiesTmpl = $rootScope.planPropertiesTmpl + '?r=' + Math.random();
    };  
/*    
    $scope.cleanPlan = function(){
      ValidateByPassword.response('success', 'operationSuccess', function(){console.log('ValidateByPassword.response:OK-callback')})
//      ValidateByPassword.response('failure', 'permissionDenied', function(){console.log('ValidateByPassword.response:OK-callback')})
    }
*/
    $scope.addPlan = function(){
      $scope.newPlans.push($scope.plan);
      $scope.cleanPlan();
    };    
    $scope.editPlan = function(n){
      $scope.disableEditing = false;
      $scope.plan = JSON.parse(JSON.stringify($scope.newPlans[n]));
      $scope.planPropertiesTmpl = $rootScope.planPropertiesTmpl + '?r=' + Math.random();
    };
    $scope.removePlan = function(n){
      $scope.newPlans.splice(n, 1);
    };
    $scope.doneEditing = function(){
      var p = $scope.plan;
      $scope.disableEditing = true;
      $scope.newPlans[p.ind] = p;
      $scope.cleanPlan();
    };
    
    $scope.addPlanValidation = function(){
      var p = $scope.plan
        , d = p.description
        ;
      return !!!(
                  p.fromDate > 0 &&
                  (p.tillDate > 0 || p.tillDate === 'permanent') &&
                  p.duration > 0 &&
                  p.interest > 0 &&
                  (d.constructor === Object && Object.keys(d).length > 0)
                );
    };
    
    $scope.createInSystem = function(){
      ValidateByPassword.validate('newPlanCreation', 'cancel',
        function(){ // OK-callback                
          var counter = $scope.newPlans.length;
          $scope.newPlans.forEach(function(el){
            delete el.ind;
            if(--counter === 0){
              OperatePlan.create({'plan': $scope.newPlans, 'userID': userID, 'sessID': sessID}, function(res){
                $scope.newPlans = [];
                if (!!res.result){
                  ValidateByPassword.response('success', 'operationSuccess');
                } else {
                  switch(res.reason){
                    case 'invalid_sessid':
                      ValidateByPassword.response('failure', 'invalidSession',
                        function(){$location.path($LOGOUT).replace();}) // Logout
                    break;
                    case 'permission_denied':
                      ValidateByPassword.response('failure', 'permissionDenied',
                        function(){$location.path($LOGOUT).replace();}) // Logout
                    break;
                    default:;
                  }
                }
              })
            }
          });
        },
        function(){ // Cancel-callback
        // Do nothing, just close a Modal
        }
      );          
    };    
  }]);

