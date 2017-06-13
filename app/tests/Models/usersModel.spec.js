var collectionName = 'users'
  , users = require('models')(collectionName)
  , count = require('models')('counters')
  , MongoClient = require('mongodb').MongoClient
  , mongo = require('config').mongo
  , DB = {};

//Test values
var newPhone = '0525643456'
  , newUserRole = ['groupAdmin']

    KukuPet = {
  userID: 0,
  userStatus: 'active',
  userRole: ['globalAdmin','businessAdmin'],
  userRating: { score: 25,
                evaluations: 5
              },
  firstName: 'Kuku',
  familyName: 'Pet',
  pictureURL: '/pub/users/photos/100001001.jpg',
  phone: '545345345',
  email: 'kuku.pet@wwmm.org',
  currency: 'ils',
  country: 'israel',
  city: 'telaviv',
  language: 'rus',
  bankAccount: [{ name: 'bankleumileisraelltd',
                  site: '900',
                  account: '234234/88',
                  accountOwner: 'קוקו פט'
                },
                {name: 'bankhapoalimltd',
                  site: '400',
                  account: '345612345',
                  accountOwner: 'קוקו פט'
                },{name: 'israeldiscountbankltd',
                  site: '3455',
                  account: '34-543645',
                  accountOwner: 'קוקו פט'
                }],
  groupAdminUserID: 100001101,
  registrationDate: Date.now
}
  ;

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
  it('should extend the Base prototypes', function(next){
    expect(users.insert).toEqual(jasmine.any(Function));
    expect(users.remove).toEqual(jasmine.any(Function));
    expect(users.update).toEqual(jasmine.any(Function));
    expect(users.updateUserRole).toEqual(jasmine.any(Function));
    expect(users.updateUserRating).toEqual(jasmine.any(Function));
    expect(users.get).toEqual(jasmine.any(Function));
    expect(users.getList).toEqual(jasmine.any(Function));
    next();
  });
  it("is there a DB server running", function(next) {
    MongoClient.connect(dbURI, function(e,db) {
      expect(e).toBe(null);
      expect(db).toBeDefined();
      DB = db;   // Setting the real DB
      count.setDB(db);
      users.setDB(db);
      next();
    });
  });
  it('INSERT: should add document to the collection', function(next){
    count.get('userID', function(e,r){
      expect(e).toBe(null);
      KukuPet.userID = r.value.seq;
      users.insert(KukuPet, function(e,r){
        expect(e).toBe(null);
        expect(r.result).toEqual({ ok: 1, n: 1 });
  //      console.log(r.result);
        next();
      });
    });
  });
  it('GET: should get the document from the collection', function(next){
    users.get(KukuPet.userID,{userRole: 1},function(e,r){
      expect(e).toBe(null);
      expect(r.userRole).toEqual(KukuPet.userRole);
//      console.log(r)
      next();
    });
  });
  it('UPDATE: should set new phone number', function(next){
    users.update(KukuPet.userID,{phone: newPhone},function(e,r){
      expect(e).toBe(null);
//      console.log(r)
      expect(r.result).toEqual({ ok: 1, nModified: 1, n: 1 });
      next();
    });
  });
  it('UPDATE userRole: should has no ability to update userRole', function(next){
    users.update(KukuPet.userID,{userRole: newUserRole},function(e,r){
      expect(e).toBe(null);
//      console.log(r)
      expect(r.result).toEqual({ ok: 1, nModified: 0, n: 1 });
      next();
    });
  });
  it('GET userRole: userRole should stay unchanged', function(next){
    users.get(KukuPet.userID,{userRole: 1},function(e,r){
      expect(e).toBe(null);
      expect(r.userRole).toEqual(KukuPet.userRole);
//      console.log(r)
      next();
    });
  });
  it('updateUserRole: should update userRole to the provided', function(next){
    users.updateUserRole(KukuPet.userID, newUserRole,function(e,r){
      expect(e).toBe(null);
//      console.log(r)
      expect(r.result).toEqual({ ok: 1, nModified: 1, n: 1 });
      next();
    });
  });
  it('GET updateUserRole: userRole should be modifyed', function(next){
    users.get(KukuPet.userID,{userRole: 1},function(e,r){
      expect(e).toBe(null);
      expect(r.userRole).toEqual(newUserRole);
//      console.log(r)
      next();
    });
  });
  it('updateUserRating: should set new score and increment evaluations', function(next){
    var score = 3;
    users.updateUserRating(KukuPet.userID, score,function(e,r){
      expect(e).toBe(null);
//      console.log(r)
      expect(r.lastErrorObject).toEqual({ updatedExisting: true, n: 1 });
      expect(r.value.userRating).toEqual({ score: 28, evaluations: 6 });
      next();
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
        expect(d.userID).toEqual(KukuPet.userID);
        expect(d.userStatus).toEqual(KukuPet.userStatus);
      });
      next();
    });
  });
  it("VERIFY: check whether the e-mail doesn't exist in the DB", function(next){
    users.verify("not.existed@mail.in.db", function(e,r){
      expect(e).toBe(null);
      expect(r).toEqual(jasmine.any(Array));
//      console.log(r);
      expect(r.length).toEqual(0);
      next();
    });
  });
  it('GETLIST: should get list of documents from the collection', function(next){
    users.getList(KukuPet.userID,{phone: 1},function(e,r){
      expect(e).toBe(null);
      expect(r).toEqual(jasmine.any(Array));
//      console.log(r);
      expect(r.length).toEqual(1);
      r.forEach(function(d){
//        console.log(d)
        expect(d.phone).toEqual(newPhone);
      });
      next();
    });
  });
  it('REMOVE: remove the document from collection', function(next){
    users.remove(KukuPet.userID, function(e,r){
      expect(e).toBe(null);
      expect(r.result).toEqual({ ok: 1, n: 1 });
//      console.log(r.result);
      next();
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
