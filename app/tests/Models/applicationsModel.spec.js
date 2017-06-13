var collectionName = 'applications',
    model = require('models')(collectionName),
    MongoClient = require('mongodb').MongoClient,
    mongo = require('config').mongo,
    DB = {},
    collection = {};


//Test values
var d = new Date(),

    app01 = { // Just created
  appID: 100201,
  userID: 100001011,
  amount: 200.00,
  balance: 200.00,
  pending: 0.00,
  plan: {
    planID: 15,
    interest: 10, // procents
    releaseDate: new Date(d.setMonth(d.getMonth() + 1))
  },
  transactions: [],
  type: 'loan',
  weight: 10,
  status: 'active',
  creationDate: Date.now(),
  negotiators: [] 
},

    app02 = { // freezed till release date
  appID: 100202,
  userID: 100001012,
  amount: 250.00,
  balance: 0.00,
  pending: 0.00,
  plan: {
    planID: 16,
    interest: 30, // procents
    releaseDate: new Date(d.setMonth(d.getMonth() + 2))
  },
  transactions: [10012, 10014, 10034],
  type: 'loan',
  weight: 0,
  status: 'freezed',
  creationDate: new Date(d.setMonth(d.getMonth() - 1)),
  negotiators: [] 
},

    app03 = { // Active with confirmation and balance.
  appID: 100203,
  userID: 100001013,
  amount: 300.00,
  balance: 100.00,
  pending: 0.00,
  plan: {
    planID: 15,
    interest: 30, // procents
    releaseDate: new Date(d.setMonth(d.getMonth() + 1))
  },
  transactions: [10020],
  type: 'loan',
  weight: 5,
  status: 'active',
  creationDate: new Date(d.setMonth(d.getMonth() - 2)),
  negotiators: [] 
},

    app04 = { // COLLECT: just created.
  appID: 100204,
  userID: 100001014,
  amount: 300.00,
  transactions: [],
  type: 'collect',
  weight: 10,
  status: 'active',
  creationDate: Date.now(),
  collectedfrom: [],
  negotiators: [100203, 100201] // negotiation process
},

    app05 = { // COLLECT: created from several apps
  appID: 100205,
  userID: 100001015,
  amount: 400.00,
  transactions: [10022, 10054, 10044],
  type: 'collect',
  weight: 5,
  status: 'active',
  creationDate: Date.now(),
  collectedfrom: [{appID: 100195, amount: 300.00}, {appID: 100180, amount: 100.00}],
  negotiators: [] 
},

    app06 = { // In negotiation process with app05 / 100205
  appID: 100195,
  userID: 100001015,
  amount: 400.00,
  balance: 400.00,
  pending: 0.00,
  plan: {
    planID: 15,
    interest: 10, // procents
    releaseDate: new Date(d.setMonth(d.getMonth() - 1))
  },
  transactions: [],
  type: 'loan',
  weight: 10,
  status: 'available',
  creationDate: new Date(d.setMonth(d.getMonth() - 2)),
  negotiators: []
},

    app07 = { // Just created
  appID: 100180,
  userID: 100001015,
  amount: 100.00,
  balance: 100.00,
  pending: 0.00,
  plan: {
    planID: 15,
    interest: 10, // procents
    releaseDate: new Date(d.setDate(d.getDate() - 1))
  },
  transactions: [],
  type: 'loan',
  weight: 10,
  status: 'available', // will be set to 'pending'
  creationDate: new Date(d.setDate(d.getDate() - 32)),
  negotiators: []
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
describe("Applicatons model", function() {
  it('should extend the prototypes', function(next){
    expect(model.setDB).toEqual(jasmine.any(Function));
    expect(model.insert).toEqual(jasmine.any(Function));
    expect(model.remove).toEqual(jasmine.any(Function));
    expect(model.update).toEqual(jasmine.any(Function));
    expect(model.get).toEqual(jasmine.any(Function));
    expect(model.getUsersApps).toEqual(jasmine.any(Function));
    expect(model.getActiveApps).toEqual(jasmine.any(Function));
    next();
  });
  it("is there a DB server running", function(next) {
    MongoClient.connect(dbURI, function(e,db) {
      expect(e).toBe(null);
      expect(db).toBeDefined();
      DB = db;   // Setting the real DB
      model.setDB(DB);
      next();
    });
  });
  it('INSERT: should add document to the collection', function(next){
    model.insert(app01, function(e,r){
      expect(e).toBe(null);
      expect(r.result).toEqual({ ok: 1, n: 1 });
//      console.log(r.result);
      // Insert all other apps.
      DB.collection(collectionName).insertMany([app02,app03,app04,app06,app07], {w:1,j:true}, function(e,r){
        expect(e).toBe(null);
        next();
      });
    });
  });
  it('GET: should get the document from the collection', function(next){
    model.get(app01.appID,{userID: 1},function(e,r){
      expect(e).toBe(null);
      expect(r.userID).toEqual(app01.userID);
//      console.log(r)
      next();
    });
  });
  it('UPDATE: should set new status "pending"', function(next){
    model.update(app07.appID,{status: 'pending'},function(e,r){
      expect(e).toBe(null);
      expect(r.result).toEqual({ ok: 1, nModified: 1, n: 1 });
//      console.log(r)
      next();
    });
  });
  it('CREATE: should create app05 and update app06 and app07', function(next){
    var count = 0;
    app05.collectedfrom.forEach(function(el){
      model.get(el.appID, {balance:1}, function(e,r){
        expect(e).toBe(null);
        el.balance = r.balance - el.amount;
        model.update(el.appID,{status: 'pending', pending: el.amount, balance: el.balance}, function(e,r){
          expect(e).toBe(null);
          expect(r.result).toEqual({ ok: 1, nModified: 1, n: 1 });
//          console.log(r.result);
          model.get(el.appID,{}, function(e,r){
            expect(e).toBe(null);
//            console.log(r);
            expect(r.pending).toEqual(el.amount);
            expect(r.balance).toEqual(el.balance);
            expect(r.status).toEqual('pending');
            if(++count === app05.collectedfrom.length){
              model.insert(app05, function(e,r){
                expect(e).toBe(null);
                expect(r.result).toEqual({ ok: 1, n: 1 });
                next();
              });
            };
          });
        });
      });
    });
  });
  it('getActiveApps: should get list of active LOAN documets from the collection', function(next){
    model.getActiveApps('loan',function(e,r){
      expect(e).toBe(null);
      expect(r).toEqual(jasmine.any(Array));
//      console.log(r);
      expect(r.length).toEqual(2);
      r.forEach(function(d){
//        console.log(d)
      });
      next();
    });
  });
  it('getActiveApps: should get list of active COLLECT documets from the collection', function(next){
    model.getActiveApps('collect',function(e,r){
      expect(e).toBe(null);
      expect(r).toEqual(jasmine.any(Array));
//      console.log(r);
      expect(r.length).toEqual(2);
      r.forEach(function(d){
//        console.log(d)
      });
      next();
    });
  });
  it('getUsersApps: should get list of documets owned by user from the collection', function(next){
    model.getUsersApps(app05.userID, {}, function(e,r){
      expect(e).toBe(null);
      expect(r).toEqual(jasmine.any(Array));
//      console.log(r);
      expect(r.length).toEqual(3);
      r.forEach(function(d){
//        console.log(d)
        expect(d.userID).toEqual(app05.userID);
      });
      next();
    });
  });

  it('REMOVE: remove app from the collection', function(next){
    model.remove(app01.appID, function(e,r){
      expect(e).toBe(null);
      expect(r.result).toEqual({ ok: 1, n: 1 });
//      console.log(r.result);
      next();
    });
  });
  it('Remove all other apps from the collection', function(next){
    DB.collection(collectionName).deleteMany({}, function(e,r){
      expect(e).toBe(null);
      expect(r.result).toEqual({ ok: 1, n: 6 });
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
