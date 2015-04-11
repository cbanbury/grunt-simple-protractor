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
  var spawn = require('child_process').spawn



  grunt.registerMultiTask('protractor', 'Run tests with protractor', function() {
    var server, seleniumProcessId, webdriverProcess, customServerProcess
    var done = this.async()
    var options = this.options({
      nodeBinary: 'node',
      autoWebdriver: true,
      autoLocalServer: true,
      localServerPort: 8080,
      seleniumAddress: 'http://localhost:4444/wd/hub'
    })

    var simpleProtractorOpts = ['runAsync', 'autoLocalServer', 'localServerPort', 
                                'autoWebdriver', 'debugWebdriver', 'nodeBinary', 'configFile']



    function finishTask() {
      if (server) {
        server.close()
        grunt.log.debug('Local server connection closed')
      }

      if (webdriverProcess) {
        webdriverProcess.kill('SIGINT')
        grunt.log.debug('Exited WebDriver process')
      }

      if (customServerProcess) {
        customServerProcess.kill('SIGINT')
        grunt.log.debug('Exited custom server process')
      }

      if (seleniumProcessId) {
        process.kill(seleniumProcessId, 'SIGINT')
        grunt.log.debug('Exited Selenium Standalone process')
      }

      done()
    }



    function runWebdriver(protractorLibPath) {
      var webdriverBinPath = path.resolve(protractorLibPath, '../../bin/webdriver-manager')
      grunt.log.debug('Webdriver process started: ' + 
                      options.nodeBinary + ' ' + webdriverBinPath + ' start')

      webdriverProcess = grunt.util.spawn({
        cmd: options.nodeBinary,
        args: [webdriverBinPath, 'start'],
        opts: { stdio: 'pipe' }
      }) 

      webdriverProcess.stdout.pipe(process.stdout)
      webdriverProcess.stderr.pipe(process.stderr)

      webdriverProcess.stdout.on('data', function findSeleniumPid(chunk) {
        chunk = chunk.toString('ascii')
        var matchObj = chunk.match(/seleniumProcess\.pid: [0-9]{0,7}/)
        if (matchObj)
          seleniumProcessId = matchObj[0].split(' ')[1]
      })
    }



    function runLocalServer() {
      if (options.localServerCommand) {
        grunt.log.debug('Starting custom server')
        var args = options.localServerCommand.split(' ');

        customServerProcess = spawn(args[0], args.slice(1), {stdio: 'inherit'})
      } else {
        server = http.createServer(function(request, response) {
          fs.readFile('.' + request.url, 'utf8', function(err, data) {
            if (err) return
            response.end(data)
          })
        })

        server.listen(options.localServerPort)
        grunt.log.debug('Local server listening on http://localhost:' + options.localServerPort)
      }
    }



    function runProtractor(protractorLibPath) {
      var protractorArgs = []
      Object.keys(options).forEach(function(key) {
        if (!simpleProtractorOpts.some(function(opt) { return opt === key })) {
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
      if (options.configFile)
        protractorArgs.unshift(options.configFile)
      protractorArgs.unshift(protractorBinPath)

      grunt.log.debug('Starting protractor: ' +
                      options.nodeBinary + ' ' + protractorArgs.join(' '))



      var protractorProcess = grunt.util.spawn({
        cmd: options.nodeBinary,
        args: protractorArgs,
        opts: { stdio: 'pipe' }
      },
      function(error, result, code) {
        grunt.log.debug('Protractor finished. (Code ' + code + ')')

        if (options.runAsync) {
          grunt.event.emit('protractor', error, result, finishTask)
        }
        else {
          if (error) {
            finishTask()
            grunt.fail.fatal('Protractor task failed.')
          }
          else {
            finishTask()
          }
        }
      })

      protractorProcess.stdout.pipe(process.stdout)
      protractorProcess.stderr.pipe(process.stderr)
    }



    function runGruntSimpleProtractor() {
      var protractorLibPath = require.resolve('protractor')

      if (options.autoLocalServer || options.localServerCommand)
        runLocalServer()

      /* Run protractor when webdriver server starts */
      if (options.autoWebdriver) {
        runWebdriver(protractorLibPath)

        if (webdriverProcess && webdriverProcess.stderr)
          webdriverProcess.stderr.on('data', function waitUntilServer(chunk) {
            chunk = chunk.toString('ascii')
            var matchObj = chunk.match(/Started .*Server/)
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
