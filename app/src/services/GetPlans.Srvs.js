wmoServices.factory('GetPlans', ['$resource','$window',
  function($resource, $window){
    var self = this;
    self.set = function(sessID){
      return $resource($REST, {}, {
        getAll:    {method:'POST', params:{api:'getPlans', operand:'all'},    headers: {'Auth': sessID}},
        getActive:    {method:'POST', params:{api:'getPlans', operand:'active'},    headers: {'Auth': sessID}},
        getPermanent: {method:'POST', params:{api:'getPlans', operand:'permanent'}, headers: {'Auth': sessID}},
        getPending: {method:'POST', params:{api:'getPlans', operand:'pending'}, headers: {'Auth': sessID}},
        getCompleted: {method:'POST', params:{api:'getPlans', operand:'completed'}, headers: {'Auth': sessID}}
      });              
    }
    return {
      getAll: function(data, fn){
        var sessID = $window.sessionStorage.getItem('sessID')
          , resource = self.set(sessID)
          ;
        resource.getAll(data, fn);
      },
      getActive: function(data, fn){
        var sessID = $window.sessionStorage.getItem('sessID')
          , resource = self.set(sessID)
          ;
        resource.getActive(data, fn);
      },
      getPermanent: function(data, fn){
        var sessID = $window.sessionStorage.getItem('sessID')
          , resource = self.set(sessID)
          ;
        resource.getPermanent(data, fn);
      },
      getCompleted: function(data, fn){
        var sessID = $window.sessionStorage.getItem('sessID')
          , resource = self.set(sessID)
          ;
        resource.getCompleted(data, fn);
      },
      getPending: function(data, fn){
        var sessID = $window.sessionStorage.getItem('sessID')
          , resource = self.set(sessID)
          ;
        resource.getPending(data, fn);
      }
    }
  }]);

