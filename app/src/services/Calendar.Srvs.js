wmoServices.factory('Calendar', [
  function(){
    var self = this;
    self.dayMilliSeconds = 1000 * 3600 * 24;
    
    self.factory = {
// time - integer representing the number of milliseconds since 1 January 1970, 00:00:00 UTC
/*
          utc: function(time){
            var d = time || new Date();
            d instanceof Date || (d = new Date(d));
            return new Date(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
          },
          today: function(){
            var d = new Date();
            return new Date(d.getFullYear(), d.getMonth(), d.getDate());
          },
*/
          utc: function(time){
            var d = time || new Date()
              , offset = new Date().getTimezoneOffset()
              , u;
            d instanceof Date || (d = new Date(d));
            u = new Date(d.getFullYear(), d.getMonth(), d.getDate());
            return new Date(u.setMinutes(u.getMinutes() - offset));
          },
          today: function(){
            return self.factory.utc();
          },
          local: function(time){
            var d = time
              , offset = new Date().getTimezoneOffset()
              ;          
            if(typeof(time) === 'number' || time instanceof Number){ // UTC time integer.
              d = new Date(time);
            }
            return new Date(d.setMinutes(d.getMinutes() + offset));
          },
          addDays: function(date, num){
            var d = date || self.factory.today()
              , num = Number(num);
//            d instanceof Date || (d = self.factory.local(d));
            d instanceof Date || (d = new Date(d));
            return new Date(d.getFullYear(), d.getMonth(), d.getDate() + num);
          },
          addMonths: function(date, num){
            var d = date || self.factory.today()
              , num = Number(num);
//            d instanceof Date || (d = self.factory.local(d));
            d instanceof Date || (d = new Date(d));
            return new Date(d.getFullYear(), d.getMonth() + num, d.getDate());
          },
          addYears: function(date, num){
            var d = date || self.factory.today()
              , num = Number(num);
//            d instanceof Date || (d = self.factory.local(d));
            d instanceof Date || (d = new Date(d));
            return new Date(d.getFullYear() + num, d.getMonth(), d.getDate());
          },
          yyyyMMdd: function(date, pad){
            var d = date || self.factory.today();
            d instanceof Date || (d = self.factory.local(d));
            var pad = pad || ''
              , yyyy = d.getFullYear()
              , MM = Number(d.getMonth()) + 1 // getMonth() is zero-based
              , dd = Number(d.getDate())
              ;
            MM < 10 && (MM = '0' + MM);
            dd < 10 && (dd = '0' + dd);
            return [yyyy, MM, dd].join(pad); // padding
          },
          dayPeriod: function(from, till){
            var from = from || self.factory.today()
              , till = till || self.factory.today();
//            from instanceof Date || (from = self.factory.local(from));
//            till instanceof Date || (till = self.factory.local(till));
            from instanceof Date || (from = new Date(from));
            till instanceof Date || (till = new Date(till));     
            return Math.round(Math.abs(till.getTime() - from.getTime()) / self.dayMilliSeconds);
          },
          dayMilliSeconds: function(){
            return self.dayMilliSeconds;
          }
    }
    return self.factory;
  }]);

