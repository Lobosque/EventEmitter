describe('EventEmitter', function() {
	var ee,
		EventEmitter = require('../dist/EventEmitter-latest.js').EventEmitter;

	beforeEach(function() {
		ee = new EventEmitter();
	});

	afterEach(function() {
		ee = null;
	})

	it('should have methods to register, emit and remove/clear event listeners', function() {
		expect(typeof ee.on).toBe('function');
		expect(typeof ee.off).toBe('function');
		expect(typeof ee.once).toBe('function');
		expect(typeof ee.emit).toBe('function');
		expect(typeof ee.getListeners).toBe('function');
	});

	it('should have methods to suspend/resume events', function() {
		expect(typeof ee.suspendEvents).toBe('function');
		expect(typeof ee.resumeEvents).toBe('function');
	});

	it('should emit events', function() {
		var spy = jasmine.createSpy();

		ee.on('event', spy);
		ee.emit('event');

		expect(spy).toHaveBeenCalled();
	});

	it('should emit event once if it was registered with "once" method', function() {
		var count = 0;

		ee.once('count', function() {
			count++;
		});

		ee.emit('count');
		ee.emit('count');

		expect(count).toBe(1);
	});

	it('should register and unregister events for a specific callback and context', function() {
		var spy = jasmine.createSpy(),
			context = {};

		ee.on('event', spy, context);
		ee.off('event', spy, context);

		ee.emit('event');

		expect(spy).not.toHaveBeenCalled();
	});

	it('should suspend and resume events', function() {
		var spy = jasmine.createSpy(),
			context = {};

		ee.on('event', spy, context);

		ee.suspendEvents();
		ee.emit('event');

		expect(spy).not.toHaveBeenCalled();

		ee.resumeEvents();
		ee.emit('event');
		expect(spy).toHaveBeenCalled();
	});
});