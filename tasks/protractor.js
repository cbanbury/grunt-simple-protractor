/* 
 * grunt-simple-protractor
 * https://github.com/Risto-Stevcev/grunt-simple-protractor
 *
 * Copyright (c) 2015 Risto Stevcev
 * Licensed under the MIT license 
 */

module.exports = function(grunt) {
  var http = require('http')
  var path = require('path')
  var fs = require('fs')



  grunt.registerMultiTask('protractor', 'Run tests with protractor', function() {
    var server, seleniumProcessId, webdriverProcess
    var done = this.async()
    var options = this.options({
      nodeBinary: 'node',
      autoWebdriver: true,
      autoLocalServer: true,
      localServerPort: 8080,
      seleniumAddress: 'http://localhost:4444/wd/hub'
    })



    function runWebdriver(protractorLibPath) {
      var webdriverBinPath = path.resolve(protractorLibPath, '../../bin/webdriver-manager')
      webdriverProcess = grunt.util.spawn({
        cmd: 'node',
        args: [webdriverBinPath, 'start'],
        opts: { stdio: 'pipe' }
      }) 

      if (options.debugWebdriver)
        webdriverProcess.stderr.pipe(process.stderr)


      function findSeleniumPid(chunk) {
        chunk = chunk.toString('ascii')
        var matchObj = chunk.match(/seleniumProcess\.pid: [0-9]{0,7}/)
        if (matchObj)
          seleniumProcessId = matchObj[0].split(' ')[1]
      }

      webdriverProcess.stdout.on('data', findSeleniumPid)
    }



    function runLocalServer() {
      server = http.createServer(function(request, response) {
        fs.readFile('.' + request.url, 'utf8', function(err, data) {
          if (err) return 
          response.end(data)
        })
      })

      server.listen(options.localServerPort)
      grunt.log.writeln('Local server listening on http://localhost:' + options.localServerPort)
    }



    function runProtractor(protractorLibPath) {
      var protractorArgs = []
      Object.keys(options).forEach(function(key) {
        if (key !== 'nodeBinary' && key !== 'localServerPort' && key !== 'configFile') {
          if (typeof options[key] === 'boolean' && options[key] === true) {
            protractorArgs.push('--' + key)
          }
          else {
            protractorArgs.push('--' + key)
            protractorArgs.push(options[key])
          }
        }
      })


      var protractorBinPath = path.resolve(protractorLibPath, '../../bin/protractor')
      protractorArgs.unshift(protractorBinPath)
      if (options.configFile)
        protractorArgs.push(options.configFile)


      var protractorProcess = grunt.util.spawn({
        cmd: options.nodeBinary,
        args: protractorArgs,
        opts: { stdio: 'pipe' }
      }, 
      function(error, result, code) {
        function finish() {
          if (server) {
            server.close()
            grunt.log.writeln('Local server connection closed')
          }

          if (webdriverProcess) {
            webdriverProcess.kill('SIGINT')
            grunt.log.writeln('Exited WebDriver process')
          }

          if (seleniumProcessId) {
            process.kill(seleniumProcessId, 'SIGINT')
            grunt.log.writeln('Exited Selenium Standalone process')
          }

          done()
        }

        if (options.runAsync) {
          grunt.event.emit('protractor', error, result, finish)
        }
        else {
          if (error) {
            grunt.log.error(result.stdout)
            finish()
            grunt.fail.fatal('Protractor task failed')
          }
          else {
            grunt.log.write(result)
            finish()
          }
        }
      })
    }
    


    function runGruntSimpleProtractor() {
      var protractorLibPath = require.resolve('protractor')

      if (options.autoLocalServer)
        runLocalServer()

      /* Run protractor when webdriver server starts */
      if (options.autoWebdriver) {
        runWebdriver(protractorLibPath)

        webdriverProcess.stderr.on('data', function(chunk) {
          chunk = chunk.toString('ascii')
          var matchObj = chunk.match(/Started SocketListener/)
          if (matchObj)
            runProtractor(protractorLibPath)
        })
      }
      else {
        runProtractor(protractorLibPath)
      }
    }


    runGruntSimpleProtractor()
  })
}
