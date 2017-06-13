var path = require('path');

// Global variables
var base = process.cwd()
  , app = path.join(base,'app')
  , config = require(path.join(app, 'node_modules/config'))
  , fe_js = path.join(app, 'fe/js')
  , src_js = path.join(app, 'src/js')
  , index = 'index.js'
  ;

var sources = {
  translate:   path.join(app, 'node_modules/translate'),
  apis:        path.join(app, 'node_modules/apis'),
  globals:     path.join(app, 'node_modules/config'),
  statics:     path.join(app, 'src/statics'),
  controllers: path.join(app, 'src/controllers'),
  services:    path.join(app, 'src/services'),
  tests:       path.join(app, 'src/tests')
}

var jsons = {
  supportedLangsList: JSON.stringify(config.globals.supportedLangsList),
  rtlLangsList:       JSON.stringify(config.globals.rtlLangsList),
  countries:          JSON.stringify(config.globals.country),
  roleList:           JSON.stringify(config.globals.roleList),
  userStatusList:     JSON.stringify(config.globals.userStatusList),
  planProperties:     JSON.stringify(config.planProperties)
}

var tasks = {
    concat: {
      translate: {
        src: ['dictionary.js', 'translate.js']
             .map((file)=>{return path.join(sources.translate, file)}),
        dest: path.join(sources.translate, index)
      },
      apis: {
        src: ['globals.js', 'helpers.js', '*.api.js']
             .map((file)=>{return path.join(sources.apis, file)}),
        dest: path.join(sources.apis, index)
      },
      controllers: {
        src: ['HeadCtrl.js', '*.Ctrl.js']
             .map((file)=>{return path.join(sources.controllers, file)}),
        dest: path.join(src_js, 'controllers.js')
      },
      services: {
        src: ['HeadSrvs.js', '*.Srvs.js']
             .map((file)=>{return path.join(sources.services, file)}),
        dest: path.join(src_js, 'services.js')
      },
      tests: {
        src: ['HeadCtrl.js', '*.Ctrl.js']
             .map((file)=>{return path.join(sources.tests, file)}),
        dest: path.join(src_js, 'tests.js')
      }
    },
    file_append: {
      appends: {
        files: [
          // dictionary.js
          { append: '\nvar $LANGS =' + jsons.supportedLangsList + ';\n' +
                    '\nvar $RTLS =' + jsons.rtlLangsList + ';\n'
                    ,
            input: path.join(sources.translate, 'dictionary.js'),
            output: path.join(src_js, '/dictionary.js')
          },
          // globals.js
          { append: '\nvar $COUNTRIES = ' + jsons.countries + ';\n' +
                    '\nvar $ROLELIST = ' + jsons.roleList + ';\n'   +
                    '\nvar $USERSTATUSLIST = ' + jsons.userStatusList + ';\n' +
                    '\nvar $PLANPROPERTIES = ' + jsons.planProperties + ';\n'
                    ,
            input: path.join(sources.globals, 'globals.js'),
            output: path.join(src_js, 'globals.js')
          }
        ]
      }
    },
    copy: {
      statics: {
        expand: true,
        cwd: sources.statics,
        src: ['*js'],
        dest: src_js
      },
      copy: {
        expand: true,
        cwd: src_js,
        src: ['*js'],
        dest: fe_js,
        rename: function(dest, src) {
          // use the source directory to create the file
          // example with your directory structure
          //   dest = 'dev/js/'
          //   src = 'main.js'
          //   returned value is dev/js/main.min.js
          return path.join(dest, src.replace(/\.js$/,'.min.js'));
        }
      }
    },
    uglify: {
      sources: {
        files: [{
          expand: true,
          cwd: src_js,
          src: ['*js'],
          dest: fe_js,
          rename: function(dest, src) {
            return path.join(dest, src.replace(/\.js$/,'.min.js'));
          }
        }]
      }
    },
    watch: {
      options: {
        interval: 500
      },
      make: {
        files: [path.join(app, '/**/*.js'),
                '!' + path.join(app, '/fe/js/*js'),
                '!' + path.join(app, '/src/js/*js'),
                '!' + path.join(app, '/**/index.js')],
        tasks: ['cc:make']
      },
      dev: {
        files: [path.join(app, '/**/*.js'),
                '!' + path.join(app, '/fe/js/*js'),
                '!' + path.join(app, '/src/js/*js'),
                '!' + path.join(app, '/**/index.js')],
        tasks: ['cc:copy']
      }
    }
};

// GRUNT
module.exports = function(grunt) {
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-file-append');

  grunt.initConfig(tasks);
  grunt.registerTask('default', ['cc:make']);
  grunt.registerTask('cc:statics', ['concat', 'file_append', 'copy:statics']);
  grunt.registerTask('cc:copy', ['cc:statics', 'copy:copy']);
  grunt.registerTask('cc:make', ['cc:statics', 'uglify']);
//  grunt.registerTask('dev', ['watch:dev']);
  grunt.registerTask('dev', ['watch:make']);
  grunt.registerTask('make', ['cc:make']);
}
