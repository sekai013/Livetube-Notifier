module.exports = function(grunt) {
	grunt.initConfig({
		pkg : grunt.file.readJSON('package.json'),
		dirs: {
			source: 'source',
			build : 'build',
		},
		coffee: {
			conpile: {
				options: {
					join: true,
					bare: true
				},
				files: {
					'<%= dirs.source %>/popup/popup.js': '<%= dirs.source %>/popup/coffee/*.coffee',
				}
			},
			compileBG: {
				options: {
					bare: true
				},
				files: {
					'<%= dirs.build %>/background.js': '<%= dirs.source %>/background.coffee',
				}
			}
		},
		concat: {
			dist: {
				src : ['<%= dirs.source %>/concat/intro.js', '<%= dirs.source %>/popup/popup.js', '<%= dirs.source %>/concat/outro.js'],
				dest: '<%= dirs.build %>/popup/popup.js'
			}
		},
		uglify: {
			options: {
				banner: '/*! Livetube Notifier v<%= pkg.version %> Github repo: <%= pkg.homepage %> */\n',
				sourceMapIn: '<%= dirs.build %>/<%= pkg.name %>.js.map'
			},
			dest: {
				files: {
					'<%= dirs.build %>/background.js'  : '<%= dirs.build %>/background.js',
					'<%= dirs.build %>/popup/popup.js' : '<%= dirs.build %>/popup/popup.js',
				}
			}
		},
		cssmin: {
			target: {
				files: {
					'<%= dirs.build %>/popup/popup.css': '<%= dirs.source %>/popup/css/*.css',
				}
			}
		},
		copy: {
			main: {
				files: [{
					expand: true,
					cwd: 'source',
					src: [
						'manifest.json',
						'LICENSE',
						'popup/popup.html',
						'popup/lib/**',
						'icons/**'
					],
					dest: 'build/'
				}],
			},
		},
		clean: {
			js: ["source/background.js", "source/popup/popup.js", "source/popup/coffee/*.js"]
		},
	});

	grunt.loadNpmTasks('grunt-contrib-coffee');
	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-cssmin');
	grunt.loadNpmTasks('grunt-contrib-copy');
	grunt.loadNpmTasks('grunt-contrib-clean');

	grunt.registerTask('update', 'Update package.json and manifest.json', function(version) {
		var pkg = grunt.file.readJSON('package.json');
		var manifest = grunt.file.readJSON('source/manifest.json');
		var newVersion = (+pkg.version.split('.').join('') + +version).toString().split('').join('.');

		pkg.version = newVersion;
		manifest.version = newVersion;

		grunt.file.write('package.json', JSON.stringify(pkg, null, '  '));
		grunt.file.write('source/manifest.json', JSON.stringify(manifest, null, '  '));
		grunt.file.write('build/manifest.json', JSON.stringify(manifest, null, '  '));
	});

	grunt.registerTask('default', 'Build Livetube Notifier without minifing', [
		'coffee',
		'concat',
		'cssmin',
		'copy',
	]);

	grunt.registerTask('build', 'Build Livetube Notifier', [
		'coffee',
		'concat',
		'uglify',
		'cssmin',
		'copy',
		'clean',
	]);
};
