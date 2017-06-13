#!/bin/env node

process.argv.length !== 3 && usage();

// Variables:
var userID = process.argv[2]
  , userRole = []
  ;

// Helpers
function usage () {
  var program = process.argv[1].replace(/.*\//,'');
  console.log('The correct usage: '+program+' userID');
  process.exit();
}

function disconnect(db){
  db.close();
  process.exit();
}

// DB
var users = require('models')('users')
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

MongoClient.connect(dbURI, function(e,db){
  users.setDB(db);
  users.updateUserRole(userID, userRole, function(e,r){
    if(e){
      console.error('users.updateUserRole: '+e);
      disconnect(db);
    };
    console.log('userID: '+userID);
    console.log(r.result);
    disconnect(db);
  });
});

