var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var api = require('apis')
  , LDAP = require('ldap-client')
  , connect = require('config').ldap.connect
  , ldapClient = new LDAP(connect)
  , ldap = require('ldap')
  ;

var routes = require('./routes');

// DB
var MongoClient = require('mongodb').MongoClient
  , mongo = require('config').mongo
  , dbURI = 'mongodb://' +
    mongo.dbuser +
    ':' +
    mongo.dbpass +
    '@' +
    mongo.host +
    ':' +
    mongo.port +
    '/' + mongo.dbname;

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hjs');

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

// Set the docRoot directory
app.use(require('less-middleware')(path.join(__dirname, 'fe')));
app.use(express.static(path.join(__dirname, 'fe')));
// uncomment after placing your favicon in /fe
app.use(favicon(path.join(__dirname, 'fe', 'favicon.ico')));


// ******************************************************************
// Everything inside the MongoClient
// ******************************************************************

MongoClient.connect(dbURI, function(err, db) {
  if(err) throw console.log('Sorry, there is no mongo db server running.');

// INITs
// ******************************************************************
  ldap.init(ldapClient);
  ldap.setDB(db);
  api.setDB(db);


// Routers
// ******************************************************************

  app.use('/', routes);

  app.post('/rest/:api', function(req, res, next) {
    req.db = db;
    req.accepts('application/json');
    res.setHeader('content-type', 'application/json');
    api[req.params.api](req, res, next);
  });


// ******************************************************************
// Error Handlers
// ******************************************************************

// catch 404 and forward to error handler
  app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
  });

// error handlers

// development error handler
// will print stacktrace
  if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
      res.status(err.status || 500);
      res.render('error', {
        message: err.message,
        error: err
      });
    });
  }

// production error handler
// no stacktraces leaked to user
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: {}
    });
  });

}); // End of MongoClient

module.exports = app;
