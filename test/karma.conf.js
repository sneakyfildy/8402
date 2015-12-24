module.exports = function(config) {
  config.set({
    basePath: '',
    frameworks: ['qunit', 'requirejs'],
    files: [
        {pattern: 'images/**/*.gif', watched: false, included: false, served: true},
	    'test/prepare.js',
        'js/vendor/angular/angular.min.js',
        'js/vendor/angular/angular-route.min.js',
        {pattern: 'js/vendor/**/*.js', included: false},
        {pattern: 'js/vendor/**/*.map', included: false},
        {pattern: 'js/app/components/**/*.js', included: false},
        {pattern: 'test/r/**/*.Test.js', included: false},
        'test/test.main.js'
    ],
    proxies:  {
       '/static/images/': 'images/'
    },
    exclude: [
    ],
    reporters: ['progress', 'coverage'],
    preprocessors: {
	  'js/src/**/*.js': ['coverage']
    },
    coverageReporter: {
      type: 'html',
	  dir: 'coverage/'
    },
    port: 9876,
    colors: true,
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_DEBUG,
    autoWatch: false,
    browsers: ['Chrome'/*, 'Firefox', 'Safari'*/],
    captureTimeout: 60000,
    singleRun: false
  });
};