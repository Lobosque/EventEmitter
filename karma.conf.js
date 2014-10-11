module.exports = function(config) {
	config.set({
		browsers: ['PhantomJS'],
		frameworks: ['jasmine'],
		files: ['src/EventEmitter.js', 'test/EventEmitter.spec.js']
	});
};
