module.exports = function(grunt) {
  grunt.initConfig({
    protractor: {
      basic: {
        options: {
          verbose: true,
          specs: ['test/*.e2e.js'],
          resultJsonOutputFile: 'test/output/actual.json'
        }
      },
      configfile: {
        options: {
          configFile: 'test/sample.conf'
        }
      }
    },
    replace: {
      basic: {
        overwrite: true,
        src: ['test/output/*.json'],
        replacements: [{
          from: /"duration": [0-9]*/g,
          to: '"duration": 0'
        }]
      }
    },
    file_compare: {
      basic: ['test/output/*.json']
    }
  })


  grunt.loadTasks('tasks')
  grunt.loadNpmTasks('grunt-text-replace')
  grunt.loadNpmTasks('grunt-file-compare')

  grunt.registerTask('default', ['protractor:basic', 'replace', 'file_compare'])
}
