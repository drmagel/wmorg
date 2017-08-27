/**
* Test description:
* o Preparation:
*   - Create 4 users, one is a GlobalAdmin, second one is BusinessAdmin
*   - Create a plan
* o Test bed:
* o Cleaning
*   - Remove users
* 
* o 
*   - 
* 
**/
// LDAP
var LDAP = require('ldap-client')
  , connect = require('config').ldap.connect
  , ldapClient = new LDAP(connect)
  , ldap = require('ldap');
ldap.init(ldapClient);

// DB
var session = require('models')('sessions')
  , users = require('models')('users')
  , enrolls = require('models')('enrolls')
  , MongoClient = require('mongodb').MongoClient
  , mongo = require('config').mongo
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

//HTTP
var port = require('config').server.port
  , http = require('http')
  , post = {
      host: '127.0.0.1',
      port: port,
      method: 'POST',
      headers: {'Content-Type': 'application/json'}
    }
  , request = function(post, fn){
      return http.request(post, function(res){
        var str = '';
        res.on('data', function(chunk){str += chunk;});
        res.on('end', function(){fn(JSON.parse(str))});
      });
    }
  , createdPlans = []
;


// Test values

var KP = {
      lang: 'rus',
      email: 'kuku@v30.amdocs.com',
      password: '1234'
    }

  , KimiPut = {
      firstName:  'Кими',
      familyName: 'Пут',
      phone: '545433554',
      email: 'kuku@v30.amdocs.com',
      currency: 'ils',
      country: 'israel',
      city: 'telaviv',
      language: 'rus',
      bankAccount: [{ name: 'bankleumileisraelltd',
                      site: '900',
                      account: '234234/88',
                      accountOwner: 'קימי פוט'
                    },
                    {name: 'bankhapoalimltd',
                      site: '400',
                      account: '345612345',
                      accountOwner: 'קימי פוט'
                    },
                    {name: 'israeldiscountbankltd',
                      site: '3455',
                      account: '34-543645',
                      accountOwner: 'קימי פוט'
                    }]
    }

  , GA = {
      lang: 'eng',
      email: 'gaga@v30.amdocs.com',
      password: '1234'
    }

  , GenaAlter = {
      firstName:  'Gena',
      familyName: 'Alter',
      phone: '545433666',
      email: 'gaga@v30.amdocs.com',
      currency: 'ils',
      country: 'israel',
      city: 'kfarsaba',
      language: 'eng',
      bankAccount: [{ name: 'bankleumileisraelltd',
                      site: '900',
                      account: '234234/88',
                      accountOwner: 'Gena Alter'
                    },
                    {name: 'bankhapoalimltd',
                      site: '400',
                      account: '345612345',
                      accountOwner: 'Gena Alter'
                    },
                    {name: 'israeldiscountbankltd',
                      site: '3455',
                      account: '34-543645',
                      accountOwner: 'Gena Alter'
                    }]
      
    }
  
  , GL = {
      lang: 'heb',
      email: 'lglg@v30.amdocs.com',
      password: '1234'
    }

  , GoshaLummer = {
      firstName:  'גושה',
      familyName: 'לומר',
      phone: '545433688',
      email: 'lglg@v30.amdocs.com',
      currency: 'ils',
      country: 'israel',
      city: 'roshain',
      language: 'heb',
      bankAccount: [{ name: 'bankleumileisraelltd',
                      site: '910',
                      account: '234243/88',
                      accountOwner: 'גושה לומר'
                    },
                    {name: 'bankhapoalimltd',
                      site: '40',
                      account: '345612443',
                      accountOwner: 'גושה לומר'
                    },
                    {name: 'israeldiscountbankltd',
                      site: '34',
                      account: '34-543232',
                      accountOwner: 'גושה לומר'
                    }]
      
    }
    
  , MH = {
      lang: 'heb',
      email: 'moti@v30.amdocs.com',
      password: '1234'
    }

  , MotiHammer = {
      firstName:  'מוטי',
      familyName: 'פטיש',
      phone: '545433989',
      email: 'moti@v30.amdocs.com',
      currency: 'ils',
      country: 'israel',
      city: 'ashdod',
      language: 'heb',
      bankAccount: [{ name: 'bankleumileisraelltd',
                      site: '934',
                      account: '234978/88',
                      accountOwner: 'מוטי פטיש'
                    },
                    {name: 'bankhapoalimltd',
                      site: '456',
                      account: '345612989',
                      accountOwner: 'מוטי פטיש'
                    },
                    {name: 'israeldiscountbankltd',
                      site: '35',
                      account: '34-543567',
                      accountOwner: 'מוטי פטיש'
                    }]
      
    }
    
  , testUsers = []
;


function getTime(num){
  var d = new Date()
  return new Date(d.setMonth(num)).getTime();
};

var d = new Date()
  , month = d.getMonth()
  , today = d.getDate()
  , tomorrow = new Date(d.setDate(today + 1)).getTime()
  ;

//
// Creating initial test components
//
describe("REST API:", function(){
  it("is there a DB server running", function(next) {
    MongoClient.connect(dbURI, function(e,db) {
      expect(e).toBe(null);
      expect(db).toBeDefined();
      DB = db;   // Setting the real DB
      users.setDB(DB);
      session.setDB(DB);
      enrolls.setDB(DB);
      next();
    });
  });
//GA - Gena Alter, the Global Admin
  it("ENROLL GA: check the e-mail and respond with strings", function(next){
    post.path = '/rest/enroll';
    post.headers['Auth'] = 'enroll';   
    var U = {S: GA}
      , json = {'operand': 'checkEmail',
                'email': U.S.email,
                'lang': U.S.lang
               }
      , req = request(post, function(res){
//console.log(res);
          enrolls.bring(U.S.email, function(e,r){
            expect(e).toBe(null);
//console.log(r);
            expect(r).not.toBe(null);
            U.S.string = r.string;
            U.S.number = r.number;
            next();
          });
        });
    req.write(JSON.stringify(json));
    req.end();
  });
  it("createUser GA: Create new user Gena Alter, the Global Admin", function(next){
    post.path = '/rest/createUser';
    post.headers['Auth'] = 'createuser';   
    var U = {S: GA, ser: GenaAlter}
      , json = {'email': U.S.email,
                'password': U.S.password,
                'string': U.S.string,
                'number': U.S.number,
                'user': U.ser
               }
      , req = request(post, function(res){
//console.log(res);
      expect(res.result).toBe(true);
      expect(res.sessID).not.toBe(null);
      expect(res.userID).not.toBe(null);
      U.S.userID = res.userID;
      U.S.sessID = res.sessID;
      testUsers.push(U.S);
      // manually assign Gena Alter (GA) the globalAdmin role
      users.updateUserRole(GA.userID, ['globalAdmin'], function(e,r){
        expect(e).toBe(null);
        expect(r.result).toEqual({ ok: 1, nModified: 1, n: 1 });
//console.log(r);
        next();
      });
    });
    req.write(JSON.stringify(json));
    req.end();
  }); // Global Admin

//KP - Kimi Put
  it("ENROLL KP: check the e-mail and respond with strings", function(next){
    post.path = '/rest/enroll';
    post.headers['Auth'] = 'enroll';   
    var U = {S: KP}
      , json = {'operand': 'checkEmail',
                'email': U.S.email,
                'lang': U.S.lang
               }
      , req = request(post, function(res){
//console.log(res);
          enrolls.bring(U.S.email, function(e,r){
            expect(e).toBe(null);
//console.log(r);
            expect(r).not.toBe(null);
            U.S.string = r.string;
            U.S.number = r.number;
            next();
          });
        });
    req.write(JSON.stringify(json));
    req.end();
  });
  it("createUser KP: Create new user Kimi Put", function(next){
    post.path = '/rest/createUser';
    post.headers['Auth'] = 'createuser';   
    var U = {S: KP, ser: KimiPut}
      , json = {'email': U.S.email,
                'password': U.S.password,
                'string': U.S.string,
                'number': U.S.number,
                'user': U.ser
               }
      , req = request(post, function(res){
//console.log(res);
      expect(res.result).toBe(true);
      expect(res.sessID).not.toBe(null);
      expect(res.userID).not.toBe(null);
      U.S.userID = res.userID;
      U.S.sessID = res.sessID;
      testUsers.push(U.S);
      next();
    });
    req.write(JSON.stringify(json));
    req.end();
  });

// GL - Gosha Lummer
  it("ENROLL GL: check the e-mail and respond with strings", function(next){
    post.path = '/rest/enroll';
    post.headers['Auth'] = 'enroll';   
    var U = {S: GL}
      , json = {'operand': 'checkEmail',
                'email': U.S.email,
                'lang': U.S.lang
               }
      , req = request(post, function(res){
//console.log(res);
          enrolls.bring(U.S.email, function(e,r){
            expect(e).toBe(null);
//console.log(r);
            expect(r).not.toBe(null);
            U.S.string = r.string;
            U.S.number = r.number;
            next();
          });
        });
    req.write(JSON.stringify(json));
    req.end();
  });
  it("createUser GL: Create new user Gosha Lummer", function(next){
    post.path = '/rest/createUser';
    post.headers['Auth'] = 'createuser';   
    var U = {S: GL, ser: GoshaLummer}
      , json = {'email': U.S.email,
                'password': U.S.password,
                'string': U.S.string,
                'number': U.S.number,
                'user': U.ser
               }
      , req = request(post, function(res){
//console.log(res);
      expect(res.result).toBe(true);
      expect(res.sessID).not.toBe(null);
      expect(res.userID).not.toBe(null);
      U.S.userID = res.userID;
      U.S.sessID = res.sessID;
      testUsers.push(U.S);
      next();
    });
    req.write(JSON.stringify(json));
    req.end();
  });
// MH - Moti Hammer
  it("ENROLL MH: check the e-mail and respond with strings", function(next){
    post.path = '/rest/enroll';
    post.headers['Auth'] = 'enroll';   
    var U = {S: MH}
      , json = {'operand': 'checkEmail',
                'email': U.S.email,
                'lang': U.S.lang
               }
      , req = request(post, function(res){
//console.log(res);
          enrolls.bring(U.S.email, function(e,r){
            expect(e).toBe(null);
//console.log(r);
            expect(r).not.toBe(null);
            U.S.string = r.string;
            U.S.number = r.number;
            next();
          });
        });
    req.write(JSON.stringify(json));
    req.end();
  });
  it("createUser MH: Create new user Moti Hammer", function(next){
    post.path = '/rest/createUser';
    post.headers['Auth'] = 'createuser';   
    var U = {S: MH, ser: MotiHammer}
      , json = {'email': U.S.email,
                'password': U.S.password,
                'string': U.S.string,
                'number': U.S.number,
                'user': U.ser
               }
      , req = request(post, function(res){
//console.log(res);
      expect(res.result).toBe(true);
      expect(res.sessID).not.toBe(null);
      expect(res.userID).not.toBe(null);
      U.S.userID = res.userID;
      U.S.sessID = res.sessID;
      testUsers.push(U.S);
      next();
    });
    req.write(JSON.stringify(json));
    req.end();
  });

  
//
// Testbed - testing the Applications APIs
//



//
// Removing test objects from the system
//
 
/* 16
  it(": ", function(next){
    post.path = '/rest/';
    post.headers['Auth'] = KP.sessID;
    var json = {'userID': KP.userID,
                '': ,  
                '': ,  
                'sessID': KP.sessID
               }
      , req = request(post, function(res){
//console.log(res);
          expect(res.result).toBe(true);
          next();
        });
    req.write(JSON.stringify(json));
    req.end();
  });
*/


  it("Remove test users from the system", function(next){
    var count = testUsers.length;    
    testUsers.forEach(function(USER, index){
      setTimeout(function(){
        ldap.remove(USER.email, function(e,r){
          expect(e).toBe(undefined);
          expect(r).toBe(true);
          users.remove(USER.userID, function(e,r){
            expect(e).toBe(null);
            expect(r.result).toEqual({ ok: 1, n: 1 });
            session.remove(USER.sessID, function(e,r){
              expect(e).toBe(null);
              expect(r.result).toEqual({ ok: 1, n: 1 });
              if(--count === 0){next()};
            }) //session.remove
          }) //users.remove
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
