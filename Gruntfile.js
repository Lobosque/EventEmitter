module.exports = function (grunt) {
	var pkg = grunt.file.readJSON('package.json'),
		libName = pkg.name;

	// wrap files
	var wrap = function (files, dest) {
		code = grunt.file.read('build/prefix.js').toString();

		files.forEach(function (file) {
			code += grunt.file.read(file).toString();
		});

		code += grunt.file.read('build/suffix.js').toString();
		grunt.file.write(dest, code);
	};

	grunt.registerTask('wrap', function () {
		var done = this.async();
		grunt.file.glob('src/**/*.js', null, function (err, files) {
			if (!err) {
				wrap(files, 'build/$assembled.js');
			}

			done();
		});
	});

	var uglify = {
		options: {
			banner: grunt.file.read('build/banner.txt').toString()
		},

		build: {
			src: 'build/$assembled.js',
			dest: 'dist/' + libName + '-latest.js'
		},

		release: {
			src: 'build/$assembled.js',
			dest: 'dist/' + libName + '-' + pkg.version + '.js'
		}
	};

	var jasmine = {
		release: {
			src: 'dist/' + libName + '-latest.js',
			options: {
				keepRunner: true,
				outfile: './test-release.html',
				specs: [
					'test/matchers.js',
					'test/**/*Spec.js'
				]
			}
		},

		build: {
			src: 'build/$assembled.js',
			options: {
				keepRunner: true,
				outfile: './test-build.html',
				specs: [
					'test/matchers.js',
					'test/**/*Spec.js'
				]
			}
		}
	};

	var watchOptions = {
		build: {
			files: [
				'src/**/*.js',
				'test/**/*Spec.js',
			],
			tasks: ['build']
		}
	}

	grunt.initConfig({
		pkg: pkg,
		uglify: uglify,
		jasmine: jasmine,
		watch: watchOptions
	});

	Object.keys(pkg.devDependencies).forEach(function (name) {
		if (name.substring(0, 6) === 'grunt-') {
			grunt.loadNpmTasks(name);
		}
	});

	grunt.registerTask('build', ['wrap', 'uglify:build', 'jasmine:build']);
	grunt.registerTask('release', ['wrap', 'uglify:release', 'jasmine:release']);
	grunt.registerTask('test', ['jasmine:release']);
};