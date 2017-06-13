var users = require('models')('users')
  , admins = require('models')('groupadmins')
  , count = require('models')('counters')
  , MongoClient = require('mongodb').MongoClient
  , mongo = require('config').mongo
  , DB = {}
  , collection = {};

//Test values

var KukuPet = {
  userID: 0,
  userStatus: 'active',
  userRole: [],
  firstName: {  eng: 'Kuku',
                rus: 'Куку',
                heb: 'קוקו'
  },
  familyName: { eng: 'Pet',
                rus: 'Пет',
                heb: 'פט'
  },
  pictureURL: '/users/photos/',
  phone: '0545345345',
  email: 'kuku.pet@wwmm.org',
  currency: 'ILS',
  country: 'Israel',
  region: 'HaSharon',
  language: 'rus',
  bankAccount: [{ name: 'לאומי',
                  site: '900',
                  account: '234234/88',
                  accountOwner: 'קוקו פט'
                },
                {name: 'הפועלים',
                  site: '400',
                  account: '345612345',
                  accountOwner: 'קוקו פט'
                },
                {name: 'בנק דיסקונט',
                  site: '3455',
                  account: '34-543645',
                  accountOwner: 'קוקו פט'
                }],
  groupAdminUserID: 0,
  registrationDate: Date.now
};


    GroupAdmin = {
  userID: 0,
  userStatus: 'active',
  userRole: [],
  firstName: {  eng: 'Group',
                rus: 'Куку',
                heb: 'קוקו'
  },
  familyName: { eng: 'Admin',
                rus: 'Пет',
                heb: 'פט'
  },
  pictureURL: '/users/photos/',
  phone: '0545345321',
  email: 'group.admin@wwmm.org',
  currency: 'ILS',
  country: 'Israel',
  region: 'HaSharon',
  language: 'rus',
  bankAccount: [{ name: 'לאומי',
                  site: '920',
                  account: '235235/66',
                  accountOwner: 'קוקו פט'
                },
                {name: 'הפועלים',
                  site: '420',
                  account: '345612666',
                  accountOwner: 'קוקו פט'
                },
                {name: 'בנק דיסקונט',
                  site: '345',
                  account: '34-543777',
                  accountOwner: 'קוקו פט'
                }],
  groupAdminUserID: 0,
  registrationDate: Date.now
};


// Connection URI
var dbURI = 'mongodb://' +
    mongo.dbuser +
    ':' +
    mongo.dbpass +
    '@' +
    mongo.host +
    ':' +
    mongo.port +
    '/' + mongo.dbname;

// Tests. r - result, e - error, d - document, db - database
describe("Users model", function() {
  it("is there a DB server running", function(next) {
    MongoClient.connect(dbURI, function(e,db) {
      expect(e).toBe(null);
      expect(db).toBeDefined();
      DB = db;   // Setting the real DB
      users.setDB(DB);
      admins.setDB(DB);
      count.setDB(DB);
      next();
    });
  });
  it('INSERT: should add user to the collection', function(next){
    count.get('userID', function(e,r){
      expect(e).toBe(null);
      KukuPet.userID = r.value.seq;
//      console.log(r.value.seq);
      users.insert(KukuPet,function(e,r){
        expect(e).toBe(null);
        expect(r.result).toEqual({ ok: 1, n: 1 });
//        console.log(r.result);
        next();
      })
    });
  });
  it('VERIFY: check whether the e-mail exists in the DB', function(next){
    users.verify(KukuPet.email, function(e,r){
      expect(e).toBe(null);
      expect(r).toEqual(jasmine.any(Array));
//      console.log(r);
      expect(r.length).toEqual(1);
      r.forEach(function(d){
//        console.log(d)
        expect(d.email).toEqual(KukuPet.email);
      });
      next();
    });
  });
  it('INSERT and VERIFY: add User Admin', function(next){
    users.verify(GroupAdmin.email, function(e,r){
      expect(e).toBe(null);
      expect(r.length).toEqual(0);
      if (r.length === 0) {
        count.get('userID', function(e,r){
          expect(e).toBe(null);
          GroupAdmin.userID = r.value.seq;
          users.insert(GroupAdmin, function(e,r){
            expect(e).toBe(null);
            expect(r.result).toEqual({ ok: 1, n: 1 });
            next(); 
          });
        });
      };
    });
  });
  it('INSERT: set role to Group Admin ', function(next){
    var Admin = {
      userID: GroupAdmin.userID,
      firstName: GroupAdmin.firstName,
      familyName: GroupAdmin.familyName,
      pictureURL: GroupAdmin.pictureURL,
      country: GroupAdmin.country,
      region: GroupAdmin.region,
      language: GroupAdmin.language,
      members: []
    };
    admins.insert(Admin, function(e,r){
      expect(e).toBe(null);
      expect(r.result).toEqual({ ok: 1, n: 1 });
      users.get(GroupAdmin.userID, {userRole:1}, function(e,r){
        expect(e).toBe(null);
        if(r.userRole.indexOf('groupAdmin') === -1){
          users.update(GroupAdmin.userID, {userRole: r.userRole.concat(['groupAdmin'])}, function(e,r){
            expect(e).toBe(null);
            expect(r.result).toEqual({ ok: 1, nModified: 1, n: 1 });
            next();
          });
        } else {next();}
      });
    });
  });
  it('SET ADMIN: set UserAdmin as group admin of KukuPet', function(next){
// The KukuPet.userID and GroupAdmin.userID are known.    
    admins.addMember(GroupAdmin.userID, KukuPet.userID, function(e,r){
      expect(e).toBe(null);
      users.update(KukuPet.userID, {groupAdminUserID: GroupAdmin.userID}, function(e,r){
        expect(e).toBe(null);
        expect(r.result).toEqual({ ok: 1, nModified: 1, n: 1 });
        next();
      });
    });
  });
  it('REMOVE: remove the documents from collection', function(next){
    users.remove(KukuPet.userID, function(e,r){
      expect(e).toBe(null);
      users.remove(GroupAdmin.userID, function(e,r){  
        expect(e).toBe(null);
        admins.remove(GroupAdmin.userID, function(e,r){
          expect(e).toBe(null);
          next();
        });
      });
    });
  });

  it('closing the DB', function(next){
    DB.close();
    next();
  });
//  it('', function(next){
//
//    next();
//  });
});
