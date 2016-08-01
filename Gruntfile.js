module.exports = function(grunt) {

	//	Concatenation file order
	var concatFiles = [
		'src/mithril.component.slideshow.js',
		'src/start.js',
		'lib/mithril.bindings.js',
		'src/end.js',
	    'lib/touchit.js'
	];

	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		//	Create the dist
		concat: {
			distbuild: {
				options: {
					separator: ';'
				},
				files: {
					'dist/version/<%= pkg.name %>-<%= pkg.version %>.js': concatFiles,
					'dist/<%= pkg.name %>.js': concatFiles
				}
			}
		},
		uglify: {
			options: {
				banner: '/*! <%= pkg.name %> <%= pkg.version %> (built <%= grunt.template.today("dd-mm-yyyy") %>) */\n'
			},
			dist: {
				files: {
					'dist/version/<%= pkg.name %>-<%= pkg.version %>.min.js': 'dist/version/<%= pkg.name %>-<%= pkg.version %>.js',
					'dist/<%= pkg.name %>.min.js': 'dist/<%= pkg.name %>.js'
				}
			}
		},
		jshint: {
			files: ['Gruntfile.js', 'src/**/*.js'],
			options: {
				ignores: ['src/start.js', 'src/end.js'],
				// options here to override JSHint defaults
				globals: {
					jQuery: true,
					console: true,
					module: true,
					document: true
				},
				//	Ignore specific errors
				'-W015': true,	//	Indentation of }
				'-W099': true,	//	Mixed spaces and tabs
				'-W032': true	//	Unnecessary semicolon
			}
		},
		watch: {
			files: ['<%= jshint.files %>'],
			//	Just build when watching
			tasks: ['concat:testbuild', 'concat:distbuild']
		}
	});

	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-contrib-concat');

	grunt.registerTask('distbuild', ['concat:distbuild']);
	grunt.registerTask('default', ['jshint', 'concat:distbuild', 'uglify']);
};