module.exports = function(grunt) {
	var jsHintFiles, jshintGlobals, watchLessFiles, watchJsFiles,
		jsHintOptions, watchKarmaFiles, warningSupress, projectGlobals;

	watchLessFiles = ['less/**/*.less'];
	watchJsFiles = ['src/**/*.js'];
	watchKarmaFiles = [];
	jsHintFiles = ['js/src/**/*.js'];

	jsHintOptions = {
		curly: true, // if (true) {return;}
		eqeqeq: true, // ===
		//immed: true,
		//latedef: 'nofunc',
		newcap: true,
		noarg: true,
		nonew: true,
		sub: true,
		undef: true,
		boss: true,
		eqnull: true,
		quotmark: false,

		// lax
		//laxcomma: true, // var a = 1 [line break] ,b = 2;
		laxbreak: true, // suppress 'bad line breaking'
		camelcase: false, // cannot set true, cause of working with snake case server answer
		debug: true,

		// environment
		browser: true,
		devel: true,
		jquery: true,
		//ignores: [
			//'*jquery-2.0.3.min.js'
		//]

		// behavior
		force: true
	};
	jshintGlobals = {
        define: true,
        require: true,
        angular: true,
        Hammer: true,
		console: true,
        U: true
	};
	warningSupress = [
		'-W030' // allows to do: callback && $.isFunction(callback) && callback(data, textStatus, xhr);
		// suppresses: Expected an assignment or function call and instead saw an expression.
	];

	projectGlobals = [
	];

	for (var i = 0; i < projectGlobals.length; i++) {
		jshintGlobals[ projectGlobals[i] ] = true;
	}
	for (i = 0; i < warningSupress.length; i++) {
		jsHintOptions[ warningSupress[i] ] = true;
	}
	jsHintOptions.globals = jshintGlobals;

	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		less: {
			dev: {
				options: {
					strictMath: true,
					strictUnits: true
				},
				files: {
					'css/project.compiled.css': 'css/less/main.less'
				}
			},
			prod: {
				options: {
					cleancss: true,
					compress: true,
					strictMath: true,
					strictUnits: true
				},
				files: {
					'css/project.compiled.min.css': 'css/less/main.less'
				}
			}
		},
		uglify: {
			beautyful: {
				files: {
					'js/8402.r.full.js': ['js/8402.r.full.js']
				},
				options: {
					beautify: true,
					compress: false,
					mangle: false,
					preserveComments: 'some'
				}
			}
		},
		karma: {
			unit: {
				configFile: 'test/karma.conf.js',
				singleRun: true
			},
			unit_bg: {
				configFile: 'test/karma.conf.js',
				singleRun: false,
				background: true
			}
		},
		jshint : {
			all: jsHintFiles,
			options: jsHintOptions
		},
		jsduck: {
			main: {
				src: [
					'js/src/**/*.js'
				],
				dest: 'docs',
				options: {
					'warnings': ['-no_doc', '-dup_member', '-link_ambiguous'],
					'external': ['XMLHttpRequest'],
					title: 'Test Documentation'
				}
			}
		},
        requirejs: {
            options: {
                baseUrl: 'js',
                paths: {
                },
                removeCombined: true,
                optimize: 'none',
                wrap: {
                    start: "/*! DO NOT MODIFY THIS FILE, IT IS COMPILED! */\n",
                    end: ""
                }
            },
            app_release:{
                options:{
                    baseUrl: 'js/src',
                    optimize: 'uglify2',
                    out: 'js/8402.r.min.js',
                    paths: {
                        //'appFiles': 'app/components'
                    },
                    name: 'o'
                }
            },
            app_dev:{
                options:{
                    baseUrl: 'js/src',
                    optimize: 'none',
                    out: 'js/8402.r.full.js',
                    paths: {
                        //'appFiles': 'app/components'
                    },
                    name: 'o'
                }
            }
        },
		watch: {
			less: {
				files: watchLessFiles,
				tasks: ['less'],
				options: { cwd: { files: 'css' }, spawn: false } // allow grunt to work from outer directory
			},
			js:{
				files: watchJsFiles,
				tasks: ['requirejs', 'jshint', 'uglify:beautyful'],
				options: { cwd: { files: 'js', spawn: 'grunt' }, spawn: true } // allow grunt to work from outer directory
			}
		}
	});


	grunt.loadNpmTasks('grunt-contrib-less');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-karma');
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-jsduck');
    grunt.loadNpmTasks('grunt-contrib-requirejs');

	// allow grunt to work from outer directory, additional tweak in watch task
	grunt.file.setBase('../');

	grunt.registerTask('watch-add-karma', 'Adding karma to watch task', function(){
		grunt.config.merge({
			watch: {
				karma: {
					files: watchKarmaFiles,
					tasks: ['karma:unit_bg:run'],
					options: { cwd: { files: '/', spawn: 'grunt' }, spawn: true}
				}
			}
		});
	});

	grunt.registerTask('watch-add-doc', 'Adding docs generation to watch task', function(){
		grunt.config.merge({
			watch: {
				jsduck: {
					files: watchJsFiles,
					tasks: ['jsduck'],
					options: { cwd: { files: '/', spawn: 'grunt' }, spawn: true }
				}
			}
		});
	});

	// default task: watches JS/LESS files and compiles them on change
	grunt.registerTask('default', ['jshint', 'less', 'requirejs','uglify:beautyful', 'watch']);
	// task runs build process only once. "b" is for Build.
	grunt.registerTask('b', ['uglify:beautyful', 'less:dev', 'usebanner:task']);

	// task watchs JS/LESS files and runs default task, differs from default
	// in running karma tests on every file change
	grunt.registerTask('watch-b-karma', ['watch-add-karma', 'karma:unit_bg:start', 'default']);
	// task runs karma tests only once
	grunt.registerTask('test', ['karma:unit']);

	// task watches JS files and runs only docs generation
	grunt.registerTask('watch-doc', ['watch-add-doc', 'jsduck', 'watch:jsduck']);
	// task runs docs generation only once
	grunt.registerTask('doc', ['jsduck']);

	// task watches JS/LESS files and runs everything (build/test/docs)
	grunt.registerTask('watch-all', ['watch-add-doc', 'watch-add-karma', 'karma:unit_bg:start', 'default', 'jsduck', 'watch']);

    grunt.registerTask('req', ['requirejs']);
};