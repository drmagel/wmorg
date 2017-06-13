var LDAP = require('ldap-client')
  , connect = require('config').ldap.connect
  , ldapClient = new LDAP(connect)
  , ldap = require('ldap');

ldap.init(ldapClient);

// Test variables
var userID = 10000010002;

describe("LDAP", function() {
  it("should add new DN", function(next) {
    ldap.add('dima@wwmm.org','1234', userID, function(e,r){
      expect(e).toBe(undefined);
      expect(r).toBe(true);
      next();
    });
  });
  it('should authenticate the user', function(next) {
    ldap.authenticate('dima@wwmm.org','1234', function(e,data){
      expect(e).toBe(undefined);
      expect(data).not.toBe(null);
      expect(Number(data[0].sn[0])).toEqual(userID);
//console.log(data);
      next();
    });
  });
  it('shoud confirm the user request', function(next) {
    ldap.confirm('dima@wwmm.org','1234', function(e,r){
      expect(e).toBe(undefined);
      expect(r).toBe(true);
      next();
    });
  });
  it('should not confirm wrong password', function(next) {
    ldap.confirm('dima@wwmm.org','123', function(e,r){
      expect(e).not.toBe(undefined);
//console.log('\n'+e);
      expect((''+e)).toEqual('Error: Invalid credentials');
      expect(r).toBe(false);
      next();
    });
  });
  it('should update the user password', function(next) {
    ldap.updatePassword('dima@wwmm.org','1234','1111', function(e,r){
      expect(e).toBe(undefined);
      expect(r).toBe(true);
      next();
    });
  });
  it('should update the user e-mail', function(next) {
    ldap.updateMail('dima@wwmm.org','dima@gmail.com', function(e,r){
      expect(e).toBe(undefined);
      expect(r).toBe(true);
      next();
    });
  });
  it('should authenticate user with updated e-mail and password', function(next) {
    ldap.authenticate('dima@gmail.com','1111', function(e,data){
      expect(e).toBe(undefined);
      expect(data).not.toBe(null);
      expect(Number(data[0].sn[0])).toEqual(userID);
      next();
    });
  });
  it('should delete the user', function(next) {
    ldap.remove('dima@gmail.com', function(e,r){
      expect(e).toBe(undefined);
      expect(r).toBe(true);
      next();
    });
  });
  it('should close LDAP connection', function(next) {
    ldap.close();
    next();
  });
/*
  it('', function(next) {
      next();
    });
  });
*/
});

