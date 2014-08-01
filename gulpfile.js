var gulp = require('gulp'),
	concat = require('gulp-concat'),
	jasmine = require('gulp-jasmine'),
	rename = require('gulp-rename'),
	multipipe = require('multipipe'),
	fs = require('fs'),

	src = ['build/banner.txt', 'build/prefix', 'src/EventEmitter.js', 'build/suffix'],
	specSrc = [
		'dist/EventEmitter-latest.js',
		'test/EventEmitter.spec.js'
	],

	pkg = fs.readFileSync('package.json'),
	version = JSON.parse(String(pkg)).version;

gulp.task('build-latest', function() {
	var pipe = multipipe(
		gulp.src(src),
		concat('EventEmitter-latest.js'),
		gulp.dest('dist/')
	);

	pipeErr(pipe);
});

gulp.task('build-release', function() {
	var pipe = multipipe(
		gulp.src('build/EventEmitter.js'),
		uglify(),
		rename('EventEmitter-' + version + '.js'),
		gulp.dest('dist')
	);
})

gulp.task('watch', function() {
	gulp.watch(src, ['build', 'test']);
});

gulp.task('test', function() {
	pipeErr(multipipe(gulp.src(specSrc), jasmine()));
});

gulp.task('build', ['build-latest', 'test']);
gulp.task('release', ['build', 'test', 'build-release']);

function pipeErr(pipe) {
	pipe.on('error', function(err) {
		console.warn(err);
	});
}