var smtp = require('smtp');

var mail = {
  subject: 'TEST',
  html: '<b>Hello world ..</b>'
};

describe("SMTP Client", function(){
  it("should send an email", function(next){
    mail.to = 'dimar@v30.amdocs.com';
    smtp.sendMail(mail, function(e, r){
      expect(e).toBe(null);
//console.log(r);
      expect(r.response).toMatch(/Message accepted for delivery/);
      next();
    });
  });
  it("should send an email", function(next){
    mail.to = 'dimarrr@v30.amdocs.com';
    smtp.sendMail(mail, function(e, r){
//console.log(e);
      expect(e).not.toBe(null);
      expect(e.response).toMatch(/User unknown/);
      expect(r).toBe(null);
      next();
    });
  });
});

