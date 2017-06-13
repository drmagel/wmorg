#!/bin/env node

process.argv.length !== 3 && usage();

// Variables
var sessID = process.argv[2];

// Helpers
function usage () {
  var program = process.argv[1].replace(/.*\//,'');
  console.log('The correct usage: '+program+' sessID');
  process.exit();
}

function disconnect(db){
  db.close();
  process.exit();
}

// DB
var sessions = require('models')('sessions')
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
  sessions.setDB(db);
  sessions.makeExpired(sessID, function(e,r){
    if(e){
      console.error('sessions.makeExpired: '+e);
      disconnect(db);
    };
    console.log('sessID: '+sessID);
    console.log(r.result);
    disconnect(db);
  });
});
