var collectionName = 'groupadmins'
  , model = require('models')(collectionName)
  , MongoClient = require('mongodb').MongoClient
  , mongo = require('config').mongo
  , DB = {}
  , collection = {};

//Test values
var newMember = 100001011,
    newRegion = "Jerusalem",

    KukuPetAdmin = {
  userID: 100001001,
  firstName: {  eng: 'Kuku',
                rus: 'Куку',
                heb: 'קוקו'
  },
  familyName: { eng: 'Pet',
                rus: 'Пет',
                heb: 'פט'
  },
  pictureURL: '/pub/users/photos/100001001.jpg',
  country: 'Israel',
  region: 'HaSharon',
  language: 'rus',
  members: [100001012,100001025,100001020,100001014,100001015]
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
describe("Groupadmins model", function() {
  it('should extend the prototypes', function(next){
    expect(model.setDB).toEqual(jasmine.any(Function));
    expect(model.insert).toEqual(jasmine.any(Function));
    expect(model.remove).toEqual(jasmine.any(Function));
    expect(model.update).toEqual(jasmine.any(Function));
    expect(model.get).toEqual(jasmine.any(Function));
    expect(model.getList).toEqual(jasmine.any(Function));
    expect(model.addMember).toEqual(jasmine.any(Function));
    expect(model.delMember).toEqual(jasmine.any(Function));
    next();
  });
  it("is there a DB server running", function(next) {
    MongoClient.connect(dbURI, function(e,db) {
      expect(e).toBe(null);
      expect(db).toBeDefined();
      DB = db;   // Setting the real DB
      model.setDB(db);
      next();
    });
  });
  it('INSERT: should add document to the collection', function(next){
    model.insert(KukuPetAdmin, function(e,r){
      expect(e).toBe(null);
      expect(r.result).toEqual({ ok: 1, n: 1 });
//      console.log(r.result);
      next();
    });
  });
  it('GET: should get the document from the collection', function(next){
    model.get(KukuPetAdmin.userID,{userID: 1},function(e,r){
      expect(e).toBe(null);
      expect(r.userID).toEqual(KukuPetAdmin.userID);
//      console.log(r)
      next();
    });
  });
  it('UPDATE: should set new phone number', function(next){
    model.update(KukuPetAdmin.userID,{region: newRegion},function(e,r){
      expect(e).toBe(null);
      expect(r.result).toEqual({ ok: 1, nModified: 1, n: 1 });
//      console.log(r)
      next();
    });
  });
  it('GETLIST: should get list of documents from the collection', function(next){
    model.getList(KukuPetAdmin.userID,{region: 1},function(e,r){
      expect(e).toBe(null);
      expect(r).toEqual(jasmine.any(Array));
//      console.log(r);
      expect(r.length).toEqual(1);
      r.forEach(function(d){
//        console.log(d)
        expect(d.region).toEqual(newRegion);
      });
      next();
    });
  });
  it('ADDMEMBER: add new member to the list', function(next){
    model.addMember(KukuPetAdmin.userID, newMember, function(e,r){
      expect(e).toBe(null);
      expect(r.result).toEqual({ ok: 1, nModified: 1, n: 1 });
//      console.log(r);
      next();
    });
  });
  it('DELMEMBER: delete new member from the list', function(next){
    model.delMember(KukuPetAdmin.userID, newMember, function(e,r){
      expect(e).toBe(null);
      expect(r.result).toEqual({ ok: 1, nModified: 1, n: 1 });
//      console.log(r);
      next();
    });
  });
  it('REMOVE: remove the document from collection', function(next){
    model.remove(KukuPetAdmin.userID, function(e,r){
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
