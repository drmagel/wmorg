/**
* Test description:
* o Preparation:
*   - Create 4 users, one is a GlobalAdmin
*
* o Test bed:
*   1. operateGroupAdmin & employGroupAdmin
*   - Reqruit one user as GL
*   - Update GL profile from GlobalAdmin
*   - Reqruit several users as GL
*   - Choose it as GA for other 3
*   - Discharge the GL user from its position
*   - Shoose discharged GL for user
*   - Set two users as GL
*   - Chose them for other two. 
*   - switch the GLs.
*   - Discharge GLs: one and group.
*
*   2. operateGroup
*   - Reqruit GL and assign it for other users
*   - Update GL's profile
*   - Get list of members
*   - Discharge GL
*
* o Cleaning
*   - Remove users
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
;


// Test values

var waitTillDone = 10
  , KP = {
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
}

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
      groupadmins.setDB(DB);
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

//*****************************************************************
// 1. EmployGroupAdmin & operateGroupAdmin 
  it("REQRUIT - one: assign group admin privilege to Kimi Put", function(next){
    post.path = '/rest/employGroupAdmin';
    post.headers['Auth'] = GA.sessID;   
    var json = {'userID': GA.userID,
                'sessID': GA.sessID,
                'operand': 'reqruit',
                'gradmID': KP.userID
               }
      , req = request(post, function(res){
//console.log(res);
          expect(res.result).toBe(true);
          expect(res.groupAdmin[0]).toEqual(KP.userID);
          next();
        });
    req.write(JSON.stringify(json));
    req.end();
  });
  it("UPDATE PROFILE: update Kimi Put name - set all supported languages", function(next){
    post.path = '/rest/employGroupAdmin';
    post.headers['Auth'] = GA.sessID;   
    var json = {'userID': GA.userID,
                'sessID': GA.sessID,
                'operand': 'updateProfile',
                'gradmID': KP.userID,
                'data': { 'firstName':  {'eng':'Kimi', 'heb':'קימי', 'rus':'Кими'},
                          'familyName': {'eng':'Put', 'heb':'פוט', 'rus':'Пут'}
                        }
               }
      , req = request(post, function(res){
//console.log(res);
          expect(res.result).toBe(true);
          setTimeout(function(){next()}, waitTillDone); // Wait for update 
        });
    req.write(JSON.stringify(json));
    req.end();
  });
  it("UPDATE PROFILE - test results: Print Kimi Put", function(next){
    groupadmins.get(KP.userID,{},function(e,r){ // Check the result
      expect(e).toBe(null);
//console.log(r);
      expect(r.userID).toEqual(KP.userID);
      expect(r.firstName).toEqual({ eng: 'Kimi', heb: 'קימי', rus: 'Кими' });
      expect(r.familyName).toEqual({ eng: 'Put', heb: 'פוט', rus: 'Пут' });
      next();
    });
  });
  
  it("REQRUIT - many: assign group admin privilege to Gosha Lummer and Moti Hammer", function(next){
    post.path = '/rest/employGroupAdmin';
    post.headers['Auth'] = GA.sessID;   
    var json = {'userID': GA.userID,
                'sessID': GA.sessID,
                'operand': 'reqruit',
                'gradmID': [GL.userID, MH.userID]
               }
      , req = request(post, function(res){
//console.log(res);
          expect(res.result).toBe(true);
          expect(res.groupAdmin.length).toEqual(json.gradmID.length);
          expect(res.groupAdmin.every(function(el){return json.gradmID.some(function(ga){return el.userID === ga.userID})})).toBe(true);
          next();
        });
    req.write(JSON.stringify(json));
    req.end();
  });
  it("Get All: Get list of groupadmins", function(next){
    post.path = '/rest/operateGroupAdmin';
    post.headers['Auth'] = MH.sessID;   
    var json = {'userID': MH.userID,
                'sessID': MH.sessID,
                'operand': 'getAll'
                }
      , req = request(post, function(res){
//console.log(res);
          expect(res.result).toBe(true);
          expect([KP, GL, MH].every(function(el){return res.groupadmin.some(function(ga){return el.userID === ga.userID})})).toBe(true);
          next();
        });
    req.write(JSON.stringify(json));
    req.end();
  });
  it("REQRUIT - many: assign group admin privilege to Gosha Lummer and Moti Hammer again.", function(next){
    post.path = '/rest/employGroupAdmin';
    post.headers['Auth'] = GA.sessID;   
    var json = {'userID': GA.userID,
                'sessID': GA.sessID,
                'operand': 'reqruit',
                'gradmID': [GL.userID, MH.userID]
               }
      , req = request(post, function(res){
//console.log(res);
          expect(res.result).toBe(false);
          expect(res.areadyAssigned.length).toEqual(json.gradmID.length);
          expect(res.areadyAssigned.every(function(el){return json.gradmID.some(function(ga){return el.userID === ga.userID})})).toBe(true);
          next();
        });
    req.write(JSON.stringify(json));
    req.end();
  });
  it("DISCHARGE - one: remove group admin privilege from Moti Hammer", function(next){
    post.path = '/rest/employGroupAdmin';
    post.headers['Auth'] = GA.sessID;   
    var json = {'userID': GA.userID,
                'sessID': GA.sessID,
                'operand': 'discharge',
                'gradmID': MH.userID
               }
      , req = request(post, function(res){
//console.log(res);
          expect(res.result).toBe(true);
          next();
        });
    req.write(JSON.stringify(json));
    req.end();
  });

  it("ASSIGN KP: assign Kimi Put as a group admin for Moti Hammer", function(next){
    post.path = '/rest/operateGroupAdmin';
    post.headers['Auth'] = MH.sessID;   
    var json = {'userID': MH.userID,
                'sessID': MH.sessID,
                'operand': 'assign',
                'gradmID': KP.userID
               }
      , req = request(post, function(res){
//console.log(res);
          expect(res.result).toBe(true);
          setTimeout(function(){next()}, waitTillDone); // Wait for result
        });
    req.write(JSON.stringify(json));
    req.end();
  });
  it("ASSIGN KP - test results: Print Kimi Put and Moti Hammer", function(next){
    users.get(MH.userID,{},function(e,r){
      expect(e).toBe(null);
//console.log(r);
      expect(r.groupAdminUserID).toEqual(KP.userID);
    });
    groupadmins.get(KP.userID,{},function(e,r){
      expect(e).toBe(null);
//console.log(r);
      expect(r.members.indexOf(MH.userID)).toBeGreaterThan(-1);
    });
    next();
  });

  it("FIRE KP: fire Kimi Put as a group admin for Moti Hammer", function(next){
    post.path = '/rest/operateGroupAdmin';
    post.headers['Auth'] = MH.sessID;   
    var json = {'userID': MH.userID,
                'sessID': MH.sessID,
                'operand': 'fire',
                'gradmID': KP.userID
               }
      , req = request(post, function(res){
//console.log(res);
          expect(res.result).toBe(true);
          setTimeout(function(){next()}, waitTillDone); // Wait for result
        });
    req.write(JSON.stringify(json));
    req.end();
  });
  it("FIRE KP - test results: Print Kimi Put and Moti Hammer", function(next){
    users.get(MH.userID,{},function(e,r){
      expect(e).toBe(null);
//console.log(r);
      expect(r.groupAdminUserID).toEqual(1);
    });
    groupadmins.get(KP.userID,{},function(e,r){
      expect(e).toBe(null);
//console.log(r);
      expect(r.members.length).toEqual(0);
    });
    next();
  });
  it("ASSIGN KP: assign Kimi Put as a group admin for Moti Hammer", function(next){
    post.path = '/rest/operateGroupAdmin';
    post.headers['Auth'] = MH.sessID;   
    var json = {'userID': MH.userID,
                'sessID': MH.sessID,
                'operand': 'assign',
                'gradmID': KP.userID
               }
      , req = request(post, function(res){
//console.log(res);
          expect(res.result).toBe(true);
          next();
        });
    req.write(JSON.stringify(json));
    req.end();
  });
  it("REPLACE KP: replace Kimi Put by Gosha Lummer as a group admin for Moti Hammer", function(next){
    post.path = '/rest/operateGroupAdmin';
    post.headers['Auth'] = MH.sessID;   
    var json = {'userID': MH.userID,
                'sessID': MH.sessID,
                'operand': 'replace',
                'gradmID': GL.userID
               }
      , req = request(post, function(res){
//console.log(res);
          expect(res.result).toBe(true);
          setTimeout(function(){next()}, waitTillDone); // Wait for result
        });
    req.write(JSON.stringify(json));
    req.end();
  });
  it("REPLACE KP - test results: Print Kimi Put, Gosha Lummer and Moti Hammer", function(next){
    users.get(MH.userID,{},function(e,r){
      expect(e).toBe(null);
//console.log(r);
      expect(r.groupAdminUserID).toEqual(GL.userID);  
    });
    groupadmins.get(KP.userID,{},function(e,r){
      expect(e).toBe(null);
//console.log(r);
      expect(r.members.length).toEqual(0);
    });
    groupadmins.get(GL.userID,{},function(e,r){
      expect(e).toBe(null);
//console.log(r);
      expect(r.members.indexOf(MH.userID)).toBeGreaterThan(-1);
    });
    next();
  });

  
  
/*
  it("DEBUG: Print Kimi Put", function(next){
    users.get(KP.userID,{},function(e,r){
      expect(e).toBe(null);
      console.log(r);
    });
    groupadmins.get(KP.userID,{},function(e,r){
      expect(e).toBe(null);
      console.log(r);
    });
    next();
  });
*/



  it("DISCHARGE - many: remove group admin privilege from Kimi Put and Gosha Lummer", function(next){
    post.path = '/rest/employGroupAdmin';
    post.headers['Auth'] = GA.sessID;   
    var json = {'userID': GA.userID,
                'sessID': GA.sessID,
                'operand': 'discharge',
                'gradmID': [KP.userID, GL.userID]
               }
      , req = request(post, function(res){
//console.log(res);
          expect(res.result).toBe(true);
          setTimeout(function(){next()}, waitTillDone * 3); // Wait for result
        });
    req.write(JSON.stringify(json));
    req.end();
  });
  it("DISCHARGE - many - test result: Moti Hammer get '2' as a groupAdminUserID", function(next){
    users.get(MH.userID,{},function(e,r){
      expect(e).toBe(null);
//console.log(r);
      expect(r.groupAdminUserID).toEqual(2);
      next();
    });
  });
  it("ASSIGN KP: assign Kimi Put, which is not admin, as a group admin for Moti Hammer", function(next){
    post.path = '/rest/operateGroupAdmin';
    post.headers['Auth'] = MH.sessID;   
    var json = {'userID': MH.userID,
                'sessID': MH.sessID,
                'operand': 'assign',
                'gradmID': KP.userID
               }
      , req = request(post, function(res){
//console.log(res);
          expect(res.result).toBe(false);
          expect(res.reason).toEqual(reason.roleError);
          next();
        });
    req.write(JSON.stringify(json));
    req.end();
  });
//*****************************************************************

//*****************************************************************
// 2. operateGroup
  it("REQRUIT - one: assign group admin privilege to Gosha Lummer", function(next){
    post.path = '/rest/employGroupAdmin';
    post.headers['Auth'] = GA.sessID;   
    var json = {'userID': GA.userID,
                'sessID': GA.sessID,
                'operand': 'reqruit',
                'gradmID': GL.userID
               }
      , req = request(post, function(res){
//console.log(res);
          expect(res.result).toBe(true);
          expect(res.groupAdmin[0]).toEqual(GL.userID);
          next();
        });
    req.write(JSON.stringify(json));
    req.end();
  });
  it("ASSIGN GL: assign Gosha Lummer as a group admin for Moti Hammer", function(next){
    post.path = '/rest/operateGroupAdmin';
    post.headers['Auth'] = MH.sessID;   
    var json = {'userID': MH.userID,
                'sessID': MH.sessID,
                'operand': 'assign',
                'gradmID': GL.userID
               }
      , req = request(post, function(res){
//console.log(res);
          expect(res.result).toBe(true);
          next();
        });
    req.write(JSON.stringify(json));
    req.end();
  });
  it("ASSIGN GL: assign Gosha Lummer as a group admin for Kimi Put", function(next){
    post.path = '/rest/operateGroupAdmin';
    post.headers['Auth'] = KP.sessID;   
    var json = {'userID': KP.userID,
                'sessID': KP.sessID,
                'operand': 'assign',
                'gradmID': GL.userID
               }
      , req = request(post, function(res){
//console.log(res);
          expect(res.result).toBe(true);
          next();
        });
    req.write(JSON.stringify(json));
    req.end();
  });
  it("OPERATE GL: update Gosha Lummer profile", function(next){
    post.path = '/rest/operateGroup';
    post.headers['Auth'] = GL.sessID;   
    var json = {'userID': GL.userID,
                'sessID': GL.sessID,
                'operand': 'updateProfile',
                'data': { 'firstName': {'eng':'Gosha', 'rus':'Гоша', 'heb':'גושה'},
                          'familyName': {'eng':'Lummer', 'rus':'Луммер', 'heb':'לומר'},
                          'region': ['telaviv','kfarsaba','roshain'],
                          'language': ['heb','eng','rus']
                        }
               }
      , req = request(post, function(res){
//console.log(res);
          expect(res.result).toBe(true);
          expect(res.groupadmin.region.length).toEqual(3);
          expect(res.groupadmin.language.length).toEqual(3);
          next();
        });
    req.write(JSON.stringify(json));
    req.end();
  });
  it("OPERATE GL: get list of members", function(next){
    post.path = '/rest/operateGroup';
    post.headers['Auth'] = GL.sessID;   
    var json = {'userID': GL.userID,
                'sessID': GL.sessID,
                'operand': 'listGroup'
               }
      , req = request(post, function(res){
//console.log(res);
          expect(res.result).toBe(true);
          expect(res.members.length).toEqual(2);
          next();
        });
    req.write(JSON.stringify(json));
    req.end();
  });

  it("DISCHARGE - one: remove group admin privilege from Gosha Lummer", function(next){
    post.path = '/rest/employGroupAdmin';
    post.headers['Auth'] = GA.sessID;   
    var json = {'userID': GA.userID,
                'sessID': GA.sessID,
                'operand': 'discharge',
                'gradmID': GL.userID
               }
      , req = request(post, function(res){
//console.log(res);
          expect(res.result).toBe(true);
          next();
        });
    req.write(JSON.stringify(json));
    req.end();
  });

//*****************************************************************

  
/* 15
  it(": ", function(next){
    post.path = '/rest/';
    post.headers['Auth'] = KP.sessID;
    var json = {'': ,
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

//
// Removing test objects from the system
//
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
