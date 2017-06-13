wmoControllers.controller('PlanPropertiesCtrl', ['$scope', '$rootScope', 'Calendar', 'LangMngr',
  function($scope, $rootScope, Calendar, LangMngr) {
    // $scope.plan = {description:{}}; // Must be defined in the parent controller.
    var today = Calendar.today() // UTC Time
      , pndStartPer = $PLANPROPERTIES.pendingStartPeriod
      , pndFinishPer = $PLANPROPERTIES.pendingFinishPeriod
      , minActPer = $PLANPROPERTIES.minActivePeriod
      , activePeriod = minActPer
      , percentageLength = 5
      , maxPlanDuration = $PLANPROPERTIES.maxPlanDuration
      , maxPlanPercentage = $PLANPROPERTIES.maxPlanPercentage
      ;

// Helpers
    function initMinTillDate(){
      var fd = $scope.plan.fromDate;
      if (fd <= today){ // Edit Active Plan
        if(Calendar.dayPeriod(fd, today) > minActPer){ // The minumum active period is over.         
          return pndFinishPer;
        } else { // minumum active period + pending finish period
          return minActPer + pndFinishPer - Calendar.dayPeriod(fd, today);
        }
      } else { // Edit Pending Plan    
          return Calendar.dayPeriod(today, fd) + minActPer;
      }
    }

// Init
    $scope.percentageLength = percentageLength;
    $scope.maxPlanDuration = maxPlanDuration;
    $scope.tillDateInput = 'init';
    $scope.minFromDate = pndStartPer;
    $scope.minTillDate = pndStartPer + minActPer;

    
    $scope.setInputLang = function(){
      $scope.dr = {};
      $LANGS.forEach(function(lang){
        var l = lang.value
          ,dir = LangMngr.getDirection(l)
          ;
        $scope.dr[l] = {};
        $scope.dr[l].Dir = dir;
        $scope.dr[l].FltDir = LangMngr.getFloatDirection(dir);
        $scope.dr[l].OppFltDir = LangMngr.getOppositeFloatDirection(dir);
      });
    };

// Plan: New or Editing
/*
    if (typeof $scope.plan.fromDate === 'undefined'){ // New
      $scope.fromDate = Calendar.yyyyMMdd(Calendar.addDays(today, pndStartPer), '-');
      $scope.plan.fromDate = Calendar.utc($scope.fromDate).getTime();
    } else {                                          // Editing
      $scope.fromDate = Calendar.yyyyMMdd($scope.plan.fromDate, '-');
      $scope.tillDate = Calendar.yyyyMMdd(Calendar.addDays($scope.fromDate, minActPer), '-');
    };
    if(typeof $scope.plan.tillDate === 'undefined'){ // New
      $scope.tillDate = Calendar.yyyyMMdd(Calendar.addDays(today, pndStartPer + minActPer), '-');
      $scope.plan.tillDate = Calendar.utc($scope.tillDate).getTime();
    } else {                                        // Editing
      if($scope.plan.tillDate === 'permanent'){
        $scope.tillDateInput = 'unlimited';
      } else {
        $scope.tillDate = Calendar.yyyyMMdd($scope.plan.tillDate, '-');
        activePeriod = Calendar.dayPeriod($scope.plan.fromDate, $scope.plan.tillDate);
      }
    }
*/    
    if (typeof $scope.plan.fromDate === 'undefined'){ // New FromDate
      $scope.fromDate = Calendar.yyyyMMdd(Calendar.addDays(today, pndStartPer), '-');
      $scope.plan.fromDate = Calendar.utc($scope.fromDate).getTime();
    } else {                                          // Editing
      $scope.fromDate = Calendar.yyyyMMdd($scope.plan.fromDate, '-');
      $scope.tillDate = Calendar.yyyyMMdd(Calendar.addDays($scope.fromDate, minActPer), '-');
    };
    if(typeof $scope.plan.tillDate === 'undefined'){ // New TillDate
      $scope.tillDate = Calendar.yyyyMMdd(Calendar.addDays(today, pndStartPer + minActPer), '-');
      $scope.plan.tillDate = Calendar.utc($scope.tillDate).getTime();
    } else {                                        // Editing
      $scope.minTillDate = initMinTillDate();
      if($scope.plan.tillDate === 'permanent'){ // Permanent
        $scope.tillDateInput = 'unlimited';
        $scope.tillDate = Calendar.yyyyMMdd(Calendar.addDays(today, $scope.minTillDate), '-');
      } else { // Date
        $scope.tillDateInput = 'date';
        $scope.tillDate = Calendar.yyyyMMdd($scope.plan.tillDate, '-');
        activePeriod = Calendar.dayPeriod($scope.plan.fromDate, $scope.plan.tillDate);
      }
    }

// Dates - Calendar    
    $scope.setFromDate = function(inp){
      var inp = Calendar.utc(inp)
        , td  = Calendar.addDays(inp, minActPer)
        ;
      $scope.plan.fromDate = inp.getTime();
      $scope.minTillDate = minActPer + Calendar.dayPeriod(today, inp);
      $scope.tillDateInput = 'init'; // For datepicker reacreation
      if(activePeriod > 0){td = Calendar.addDays(inp, activePeriod)};
      $scope.tillDate = Calendar.yyyyMMdd(td, '-');     
    };       
    $scope.setTillDate = function(inp){
      var inp = Calendar.utc(inp);
      $scope.plan.tillDate = inp.getTime();
      activePeriod = Calendar.dayPeriod($scope.plan.fromDate, $scope.plan.tillDate);
    };   
    $scope.setTillDateInput = function(arg){
      $scope.tillDateInput = arg;
      if(arg === 'unlimited'){$scope.plan.tillDate = 'permanent'};
      if(arg === 'date'){$scope.plan.tillDate = Calendar.utc($scope.tillDate).getTime();}
    };
    
// Validations
    $scope.validatePercentage = function(flt){
      if(flt.length === 0){$scope.percentageLength = percentageLength;}
      if(flt.match(/,$/)){flt = flt.replace(/,$/,'.')};
      if(flt.match(/^\./)){
        flt = flt.replace(/^\./,'0.');
        $scope.percentageLength = percentageLength - 1;
      }
      if(flt.match(/\..*\.$/)){flt = flt.slice(0, -1)};
      if(!flt.match(/[\d\.]$/)){flt = flt.slice(0, -1)};
      if(Number(flt) > maxPlanPercentage){flt = flt.slice(0, -1)}
      return flt;
    };    
    $scope.validateDuration = function(dig){
      if(!dig.match(/[\d]$/)){dig = dig.slice(0, -1)};
      if(Number(dig) < 1 || Number(dig) > maxPlanDuration){dig = dig.slice(0, -1)}
      return dig;
    };

// Enables
    $scope.enableProperties = function(){
      if (typeof $scope.plan.fromDate === 'undefined' ||
          typeof $scope.plan.tillDate === 'undefined'){return true}; // New plan
      return $scope.plan.fromDate > today; // true for Pending plans
    };
    $scope.enableActivePeriod = function(){
      if (typeof $scope.plan.fromDate === 'undefined' ||
          typeof $scope.plan.tillDate === 'undefined'){return true}; // New plan
      if($scope.plan.tillDate === 'permanent'){return true;} // Enable update from 'Pernament' to 'Date'
      return $scope.plan.tillDate > today; // true for Pending and Active plans      
    };
    $scope.disableFromDate = function(){
      if (typeof $scope.plan.fromDate === 'undefined'){return false}; // New plan
      if ($scope.plan.fromDate <= today){return true};
      return false; // false for Pending plans
    };
  }]);
  
