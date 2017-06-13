#!/bin/env node

var toUglify = true; // true or false

var path = require('path')
  , fs = require('fs')
  , concat = require('concat-files')
  , uglifyJS = require('uglify-js')
  ;

var p = process.argv.pop()
  , program = path.basename(p)
  , base = path.dirname(p);

// Global variables
var app = path.join(base,'app')
  , config = path.join(app, 'node_modules/config')
  , fe_js = path.join(app, 'fe/js')
  , src_js = path.join(app, 'src/js')
  , index = 'index.js'
  ;


// Translate Module
function translateModule(){
  var sources = path.join(app, 'node_modules/translate')
    , jsFiles = ['dictionary.js', 'translate.js']
                .map((file)=>{return path.join(sources, file)})
    ;
  concat(jsFiles, path.join(sources, index), (err)=>{if (err) throw err; });}

// APIs Module
function apisModule(){
  var sources = path.join(app, 'node_modules/apis')
    , jsFiles = ['globals.js', 'helpers.js']
                .concat(fs.readdirSync(sources).filter((file)=>{return /.*\.api.js$/.test(file)}))
                .map((file)=>{return path.join(sources, file)})
    ;
  concat(jsFiles, path.join(sources, index), (err)=>{if (err) throw err;});
}

// Uglify section
function uglify(fileName,outFileName){
  if(toUglify) {
    var result = uglifyJS.minify(fileName, { compress: { dead_code: true } });
    fs.writeFileSync(outFileName, result.code);
  } else {
    fs.writeFileSync(outFileName, fs.readFileSync(fileName));
  }
}

function dictionary(){
  var sources = path.join(app, 'node_modules/translate') 
    , jsFiles = ['dictionary.js']
                .map((file)=>{return path.join(sources, file)})
    , outFile = path.join(src_js, 'dictionary.js')
    , minFile = path.join(fe_js, 'dictionary.min.js')
    ;

  var supportedLangsList = require(config).globals.supportedLangsList
    , rtlLangsList = require(config).globals.rtlLangsList
    ;
  var configString = '\nvar $LANGS =' + JSON.stringify(supportedLangsList) + ';\n' +
                     '\nvar $RTLS =' + JSON.stringify(rtlLangsList) + ';\n'
    ;

  concat(jsFiles, outFile, (err)=>{
    if (err) throw err;
    fs.appendFileSync(outFile, configString);
    uglify(outFile, minFile);
  });
}

function globals(){
  var sources = path.join(app, 'node_modules/config') 
    , jsFiles = ['globals.js'].map((file)=>{return path.join(sources, file)})
    , outFile = path.join(src_js, 'globals.js')
    , minFile = path.join(fe_js, 'globals.min.js')
    ;

  var countries = require(config).globals.country
    , roleList = require(config).globals.roleList
    , userStatusList = require(config).globals.userStatusList
    , planProperties = require(config).planProperties
    ;
  var configString = '\nvar $COUNTRIES = ' + JSON.stringify(countries) + ';\n' +
                     '\nvar $ROLELIST = ' + JSON.stringify(roleList) + ';\n'   +
                     '\nvar $USERSTATUSLIST = ' + JSON.stringify(userStatusList) + ';\n' +
                     '\nvar $PLANPROPERTIES = ' + JSON.stringify(planProperties) + ';\n'
    ;

  concat(jsFiles, outFile, (err)=>{
    if (err) throw err;
    fs.appendFileSync(outFile, configString);
    uglify(outFile, minFile);
  });
}

function statics(){
  var sources = path.join(app, 'src/statics')
    , jsFiles = fs.readdirSync(sources)
                .filter((file)=>{return /.*\.js$/.test(file)})
                .map((file)=>{return file.replace(/\.js/,'')})
    ;

  jsFiles.forEach((file)=>{
    var srcFile = path.join(sources, file + '.js')
      , outFile = path.join(src_js, ''+ file + '.js')
      , minFile = path.join(fe_js, file + '.min.js')
      ;
    fs.writeFileSync(outFile, fs.readFileSync(srcFile));
    uglify(outFile, minFile);
  });
}

function controllers(){
  var sources = path.join(app, 'src/controllers')
    , jsFiles = ['HeadCtrl.js']
                .concat(fs.readdirSync(sources).filter((file)=>{return /.*\.Ctrl.js$/.test(file)}))
                .map((file)=>{return path.join(sources, file)})
    , outFile = path.join(src_js, 'controllers.js')
    , minFile = path.join(fe_js, 'controllers.min.js')
  ;

  concat(jsFiles, outFile, (err)=>{
    if (err) throw err;
    uglify(outFile, minFile);
  });
}

function services(){
  var sources = path.join(app, 'src/services')
    , jsFiles = ['HeadSrvs.js']
                .concat(fs.readdirSync(sources).filter((file)=>{return /.*\.Srvs.js$/.test(file)}))
                .map((file)=>{return path.join(sources, file)})
    , outFile = path.join(src_js, 'services.js')
    , minFile = path.join(fe_js, 'services.min.js')
  ;

  concat(jsFiles, outFile, (err)=>{
    if (err) throw err;
    uglify(outFile, minFile);
  });
}

function tests(){
  var sources = path.join(app, 'src/tests')
    , jsFiles = ['HeadCtrl.js']
                .concat(fs.readdirSync(sources).filter((file)=>{return /.*\.Ctrl.js$/.test(file)}))
                .map((file)=>{return path.join(sources, file)})
    , outFile = path.join(src_js, 'tests.js')
    , minFile = path.join(fe_js, 'tests.min.js')
  ;

  concat(jsFiles, outFile, (err)=>{
    if (err) throw err;
    uglify(outFile, minFile);
  });
}

/* Main */
// Modules
translateModule();
apisModule()

// min.js
statics()
dictionary()
globals()
controllers();
services();
tests();
