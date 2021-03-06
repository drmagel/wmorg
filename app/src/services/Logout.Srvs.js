wmoServices.factory('Logout', ['$resource', '$window',
  function($resource, $window){
    var self = this;
    self.set =  function(sessID){
                  return $resource($REST, {}, {
                    get: {method:'POST', params:{api:'logout'}, headers:{'Auth': sessID}},
                  });
                };
    return {
      get: function(data, fn){
        var sessID = $window.sessionStorage.getItem('sessID')
          , resource = self.set(sessID)
          ;
        resource.get(data, fn);
      }      
    }
  }]);

