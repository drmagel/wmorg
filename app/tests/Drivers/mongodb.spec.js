var MongoClient = require('mongodb').MongoClient;
var mongo = require('config').mongo;
var dbURI = 'mongodb://' +
             mongo.dbuser +
             ':' +
             mongo.dbpass +
             '@' +
             mongo.host +
             ':' +
             mongo.port +
             '/' + mongo.dbname;

describe("MongoDB", function() {
  it("is there a server running", function(next) {
    MongoClient.connect(dbURI, function(err, db) {
           expect(err).toBe(null);
           expect(db).toBeDefined();
           db.close();
           next();
    });
  });
});

