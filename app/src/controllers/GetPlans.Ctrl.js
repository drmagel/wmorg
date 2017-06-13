wmoControllers.controller('GetPlansCtrl', ['$window', '$scope', '$rootScope', '$location',
                                           'GetPlans','Calendar', 'ValidateByPassword', 'OperatePlan',
  function($window, $scope, $rootScope, $location, GetPlans, Calendar, ValidateByPassword, OperatePlan) {
    var query = $rootScope.operand
      , today = Calendar.today()
      , userID = $window.sessionStorage.getItem('userID') || ''
      , sessID = $window.sessionStorage.getItem('sessID') || ''
      , pageHeaders = { 'getActive':    'activePlans',
                        'getCompleted': 'completedPlans',
                        'getPending':   'pendingPlans',
                        'getPermanent': 'permanentPlans',
                        'getAll':       'allPlans'
                      }
      ;
     

  // Inits
    $scope.plan = {description:{}}; // Obligated for PlanPropertiesCtrl controller.
    $scope.editPlan = false;
    $scope.dateFormat = $PLANPROPERTIES.planDateFormat;
    $scope.plansToDelete = $scope.plansToDelete || [];
    $scope.planList = $scope.planList || [];
    
      
    $scope.getPlanList = function(){
      GetPlans[query]({userID: userID, sessID: sessID}, function(res){
        if (!!res.result){
          $scope.planList = res.plans;
        }else{
          switch(res.reason){
            case 'sessid_expired':
              ValidateByPassword.validate('sessionExpired', 'logout',
                function(){ // OK-callback                
                  GetPlans[query]({userID: userID, sessID: sessID}, function(res){
                    $scope.planList = res.plans;
                  });
                },
                function(){ // Cancel-callback
                  $location.path($LOGOUT).replace();
                }
              );
            break;
            case 'invalid_sessid':
              ValidateByPassword.response('failure', 'invalidSession',
                function(){$location.path($LOGOUT).replace();}) // Logout
            break;
            default:;
          }
        }
      });
    };
    $scope.localTime = function(time){
      return Calendar.local(time);
    };
    $scope.getPageHeader = function(){
      return pageHeaders[query];
    };
    $scope.checkboxToDelete = function(flag, ind){
      var planID = $scope.planList[ind].planID;
      if(flag){return $scope.plansToDelete.push(planID)}
      $scope.plansToDelete = $scope.plansToDelete.filter(function(el){return el !== planID})
    };
    $scope.showTrashTD = function(){
      return $scope.planList.filter(function(el){return el.fromDate > today}).length > 0;
    };
    $scope.disableCheckbox = function(ind){
      return $scope.planList[ind].fromDate <= today;
    };
    $scope.cleanToDelete = function(){
      $scope.cleanDelete = false;
      $scope.plansToDelete = [];
    };
    $scope.deleteFromSystem = function(){
      ValidateByPassword.validate('removingPlans', 'cancel',
        function(){ // OK-callback                
          OperatePlan.remove({'planID': $scope.plansToDelete, 'userID': userID, 'sessID': sessID}, function(res){
            $scope.plansToDelete = [];
            $scope.cleanDelete = false;
            if (!!res.result){
              GetPlans[query]({userID: userID, sessID: sessID}, function(res){
                $scope.planList = res.plans;
              });
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
        },
        function(){ // Cancel-callback
        // Do nothing, just close a Modal
        }
      );      
    };
    $scope.editPlan = function(n){
      $scope.plan = JSON.parse(JSON.stringify($scope.planList[n]));
      $scope.planEditing = true;
      $scope.planPropertiesTmpl = $rootScope.planPropertiesTmpl + '?r=' + Math.random();
    };
    $scope.cancelEditing = function(){
      $scope.planEditing = false;
      $scope.plan = {description:{}};
    };
    $scope.doneEditing = function(){
      var plan = $scope.plan;
      delete plan.ind;
      ValidateByPassword.validate('updatingPlan', 'cancel',
        function(){ // OK-callback                
          OperatePlan.update({'plan': plan, 'userID': userID, 'sessID': sessID}, function(res){
            $scope.plansToDelete = [];
            $scope.cleanDelete = false;
            if (!!res.result){
              $scope.planEditing = false;
              $scope.plan = {description:{}};
              GetPlans[query]({userID: userID, sessID: sessID}, function(res){
                $scope.planList = res.plans;
              });              
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
        },
        function(){ // Cancel-callback
        // Do nothing, just close a Modal
        }
      );
    };
  }]);

