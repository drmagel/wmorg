// DB
var session = require('models')('sessions')
  , users = require('models')('users')
  , groupadmins = require('models')('groupadmins')
  , MongoClient = require('mongodb').MongoClient
  , mongo = require('config').mongo
  , reason = require('config').reasons
  , DB = {};

var dbURI = 'mongodb://' +
    mongo.dbuser +
    ':' +
    mongo.dbpass +
    '@' +
    mongo.host +
    ':' +
    mongo.port +
    '/' + mongo.dbname;

// LDAP
var LDAP = require('ldap-client')
  , connect = require('config').ldap.connect
  , ldapClient = new LDAP(connect)
  , ldap = require('ldap');
ldap.init(ldapClient);

// Test values

var KP = {
      lang: 'rus',
      email: 'kuku@v30.amdocs.com',
      password: '1234'
    }

  , GA = {
      lang: 'eng',
      email: 'gaga@v30.amdocs.com',
      password: '1234'
    }

  , GL = {
      lang: 'heb',
      email: 'lglg@v30.amdocs.com',
      password: '1234'
    }

  , MH = {
      lang: 'heb',
      email: 'moti@v30.amdocs.com',
      password: '1234'
    }

  , testUsers = [KP, GA, GL, MH]
;

describe("REST API:", function(){
  it("is there a DB server running", function(next) {
    MongoClient.connect(dbURI, function(e,db) {
      expect(e).toBe(null);
      expect(db).toBeDefined();
      DB = db;   // Setting the real DB
      users.setDB(DB);
      session.setDB(DB);
      groupadmins.setDB(DB);
      next();
    });
  });

//
// Removing test objects from the system
//
  it("Remove test users from DB", function(next){
    var count = testUsers.length;
    testUsers.forEach(function(USER, index){
      setTimeout(function(){
        users.getAllUsers({email: {$eq:USER.email}},{userID:1},function(e,lst){
          expect(e).toBe(null);
//console.log(lst);
          var cnt = lst.length;
          if(cnt){          
            lst.forEach(function(el){
                groupadmins.remove(el.userID, function(e,r){
                  expect(e).toBe(null);
                }); //groupadmins.remove
                users.remove(el.userID, function(e,r){
                  expect(e).toBe(null);
                }); //users.remove
                session.remove(el.sessID, function(e,r){
                  expect(e).toBe(null);
                }); //session.remove
                if(--cnt === 0){
                  if(--count === 0){next()};                  
                };              
            }); //lst.forEach
          } else {
            if(--count === 0){next()};
          }
        }); //users.getAllUsers
      }, index * 100); // setTimeout()
    });// testUsers.forEach
  });
  it("Remove test users from LDAP", function(next){
    var count = testUsers.length;    
    testUsers.forEach(function(USER, index){
      setTimeout(function(){
        ldap.remove(USER.email, function(e,r){
//console.log("LDAP: user email: "+USER.email);
          expect(e).toBe(undefined);
          expect(r).toBe(true);
          if(--count === 0){next()};                  
        })//ldap.remove
      }, index * 100) //setTimeout
    });//forEach
  });
  it('closing the DB and LDAP connections', function(next){
    ldap.close();
    DB.close();
    next();
  });
});
