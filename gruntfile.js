module.exports = function(grunt) {

	grunt.loadNpmTasks('grunt-concurrent');
	grunt.loadNpmTasks('grunt-nodemon');
	grunt.loadNpmTasks('grunt-contrib-watch');


	// Project configuration.
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),

		concurrent: {
			dev: {
				tasks: ['nodemon:dev', 'watch'],
				options: {
					logConcurrentOutput: true
				}
			},

			prod: {
				tasks: ['nodemon:prod', 'watch'],
				options: {
					logConcurrentOutput: true
				}
			}
		},


		nodemon: {
			dev: {
				script: './server.js',
				options: {
					ext: 'js,json,html',
					ignore: ['./node_modules/**', 'gruntfile.js'],

					// delay: 1,
					env: {
						PORT: '3000',
						NODE_ENV: 'development'
					},
					cwd: __dirname,

					callback: function(nodemon) {
						function writeReboot() {
							setTimeout(function() {
								require('fs').writeFileSync('.rebooted', Date.now());
							}, 100);
						}

						// watch "./.reboot" to refresh browser when server starts or reboots
						nodemon.on('start', writeReboot);
						nodemon.on('restart', writeReboot);
					}
				}
			},
			prod: {
				script: './server.js',
				options: {
					"execMap": {"js": "iojs --harmony"},
					ext: 'js,json,html',
					ignore: ['./node_modules/**', 'gruntfile.js'],

					// delay: 1,
					env: {
						PORT: '3000',
						NODE_ENV: 'production'
					},
					cwd: __dirname,
				}
			}
		},


		watch: {
			server: {
				files: ['./.rebooted'],
				options: {
					livereload: true
				}
			},
		},

	});



	// grunt.registerTask('minify', ['cssmin:css', 'closure-compiler2:appJs', 'uglify:appJs']);
	grunt.registerTask('dev', ['concurrent:dev']);
	grunt.registerTask('prod', ['concurrent:prod']);
	grunt.registerTask('default', ['dev']);
	// grunt.registerTask('closure', ['uglify']);
};
