// Testing the configuration file
describe("Configuration setup", function(){
  it("for DB", function(next){
    var server = require('config').server;
    expect(server.port).toBeDefined();
    expect(server.port).toEqual(jasmine.any(Number));
    next();
  });
  it("for DB", function(next){
    var mongo = require('config').mongo;
    expect(mongo.host).toEqual('127.0.0.1');
    expect(mongo.port).toEqual(27017);
    expect(mongo.dbname).toBeDefined();
    expect(mongo.dbname).toEqual(jasmine.any(String));
    expect(mongo.dbuser).toBeDefined();
    expect(mongo.dbuser).toEqual(jasmine.any(String));
    expect(mongo.dbname).toBeDefined();
    expect(mongo.dbname).toEqual(jasmine.any(String));
    next();
  });
  it("for Login Policy", function(next){
    var login = require('config').login;
    expect(login.maxWrongPasswdNum).toBeDefined();
    expect(login.maxWrongPasswdNum).toEqual(jasmine.any(Number));
    expect(login.lockedPeriod).toBeDefined();
    expect(login.lockedPeriod).toEqual(jasmine.any(Number));
    next();
  });
//  it("", function(next){
//
//    next();
//  });
});
