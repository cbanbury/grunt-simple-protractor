# grunt-simple-protractor

[![Build Info][wercker-image]][wercker-url]
[![Dev Dependencies][devDependency-image]][devDependency-url]
[![Coverage Info][coverage-image]][coverage-url]
[![Npm Version][npm-image]][npm-url]
[![Npm Downloads][downloads-image]][npm-url]

A simple protractor task for grunt. It automates much of the process of running E2E protractor 
tests. 

The task starts webdriver and a local server automatically before protractor starts, and closes the 
servers when protractor finishes.



## Basic Usage

First install the task:

    npm install grunt-simple-protractor

And then include your tests in your `Gruntfile.js`:

    module.exports = function(grunt) {
      grunt.initConfig({
        protractor: {
          your_target: {
            options: {
              specs: ['test/e2e/*.js']
            }
          }
        }
      })
    
      grunt.loadTasks('tasks')
      grunt.registerTask('default', ['protractor'])
    }

This task will automatically run webdriver by default. It will also create a local server to serve 
your web app. The base directory or your app (where your Gruntfile.js is located) is the base 
directory of your server. Both servers will close when protractor finishes, which makes it very 
useful for continuous integration environments.

If you don't want to automate webdriver, you can set `autoWebdriver` to `false`. If you start 
webdriver manually, you need to close it when grunt finishes. You can send a `SIGINT` signal to the 
selenium process to gracefully exit: `kill -s SIGINT seleniumProcess.pid`.



## Options

The options are taken from the protractor command line options with a few additions.


**runAsync**  
Type: `Boolean`, Default: `false`

Run the task asynchronously. The event will emit an event called `protractor` that sends the 
`error` and `result` from [grunt.util.spawn][grunt-util-spawn] when webdriver or protractor are run.
In order to complete the task and close the servers, the `finish` function needs to be called. Here 
is an example:

    grunt.event.on('protractor', function(error, result, finish) {
      grunt.log.write(result)
      finish()
    })

**autoLocalServer**  
Type: `Boolean`, Default: `true`

Run a local server. The local server is closed after protractor finishes.


**localServerPort**  
Type: `Number`, Default: `8080`

The server port for the local server.


**autoWebdriver**  
Type: `Boolean`, Default: `true`

Run webdriver automatically. Webdriver is closed after protractor finishes.


**debugWebdriver**  
Type: `Boolean`, Default: `false`

Display webdriver output for debugging purposes. In order for this to take effect, `autoWebdriver` 
must be set to `true`.


**nodeBinary**  
Type: `String`, Default: `'node'`

The path of the node binary.


**configFile**  
Type: `String` 

The path of a configuration file to use for protractor. Any options explicitly passed in will 
override values from this file.


**browser**  
Type: `String` 

Browsername, e.g. chrome or firefox.


**seleniumAddress**  
Type: `String` 

A running selenium address to use.


**seleniumPort**  
Type: `Number` 

Optional port for the selenium standalone server.


**baseUrl**  
Type: `String`

URL to prepend to all relative paths.


**rootElement**  
Type: `String`

Element housing ng-app, if not html or body.


**specs**  
Type: `[String]`

Comma-separated list of files to test.


**verbose**  
Type: `Boolean`, Default: `false`

Print full spec names.


**framework**  
Type: `String`, Default: `'jasmine'`

Test framework to use: jasmine, cucumber or mocha.


**resultJsonOutputFile**  
Type: `String`

Path to save JSON test result.


**troubleshoot**  
Type: `Boolean`, Default: `false`

Turn on troubleshooting output.



## Contributing

In lieu of a formal styleguide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code using [Grunt](http://gruntjs.com/).


## Release History

* **v1.0.0**   02.25.2015   Initial release


## License

Copyright (c) 2015 Risto Stevcev. Licensed under the MIT license.



[wercker-image]: https://img.shields.io/wercker/ci/54ec5ff0d9b146366325ad81.svg?style=flat
[wercker-url]: https://app.wercker.com/#applications/54ec5ff0d9b146366325ad81

[coverage-image]: https://img.shields.io/codeclimate/github/Risto-Stevcev/grunt-simple-protractor.svg?style=flat
[coverage-url]: https://codeclimate.com/github/Risto-Stevcev/grunt-simple-protractor

[devDependency-image]: https://david-dm.org/Risto-Stevcev/grunt-simple-protractor/dev-status.svg
[devDependency-url]: https://david-dm.org/Risto-Stevcev/grunt-simple-protractor#info=devDependencies

[npm-image]: https://img.shields.io/npm/v/grunt-simple-protractor.svg?style=flat
[downloads-image]: https://img.shields.io/npm/dm/grunt-simple-protractor.svg?style=flat
[npm-url]: https://npmjs.org/package/grunt-simple-protractor

[grunt-util-spawn]: http://gruntjs.com/api/grunt.util#grunt.util.spawn
