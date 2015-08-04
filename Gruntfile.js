module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    version: {
      options: {
        prefix: '@version\\s+'
      },
      defaults: {
        src: ['README.md', 'src/js/fg-arv/fg-arv.js', 'src/style/fg-arv.less']
      }
    },
    requirejs: {
      compile: {
        options: grunt.file.readJSON('build.js')
      }
    },
    less: {
      development: {
        files: {
          'src/style/fg-arv.css': ['src/style/fg-arv.less'],
          'test/simple.css': 'test/simple.less'
        }
      }
    },
    cssmin: {
      options: {
        sourceMap: true
      },
      target: {
        files: {
          'dist/fg-arv.min.css': ['src/style/fg-arv.css']
        }
      }
    },
    copy: {
      img: {
        cwd: 'src/style/',
        src: 'images/**',
        dest: 'dist',
        expand: true
      },
      deliverableDist: {
        cwd: 'dist/',
        src: '**',
        dest: 'fg-arv/dist',
        expand: true
      }
    },
    concat: {
      options: {
        separator: ';',
      },
      dist: {
        src: [
          'libs/requirejs_2.1.17/require.js',
          'dist/fg-arv.min.js'
        ],
        dest: 'dist/<%= pkg.name %>.dist.js',
      }
    },
    watch: {
      scripts: {
        files: ['src/**/*.js'],
        tasks: ['requirejs', 'dist'],
        options: {
          spawn: false,
        }
      },
      less: {
        files: ['src/**/*.less'],
        tasks: ['less', 'cssmin', 'dist'],
        options: {
          spawn: false,
        }
      },
      version: {
        files: ['package.json'],
        tasks: ['version', 'dist'],
        options: {
          spawn: false,
        }
      },

    }
  });

  // ----- PLUGINS ------
  grunt.loadNpmTasks('grunt-version');
  grunt.loadNpmTasks('grunt-contrib-requirejs');
  grunt.loadNpmTasks('grunt-contrib-less');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-watch');

  // ----- OTHER TASKS ------
  grunt.registerTask('dist', 'Task to create a distribution release.', ['version', 'less', 'cssmin', 'requirejs', 'concat', 'copy']);
  grunt.registerTask('default', ['dist']);

};