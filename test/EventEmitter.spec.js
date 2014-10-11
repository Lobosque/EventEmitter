describe('EventEmitter', function() {
	var ee;

	beforeEach(function() {
		ee = new EventEmitter();
	});

	afterEach(function() {
		ee.off();
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

		ee.on('emit-events', spy);
		ee.emit('emit-events');

		expect(spy).toHaveBeenCalled();
	});

	it('should run handler only once if it was registered with "once" method', function() {
		var count = 0;

		ee.once('once', function() {
			count++;
		});

		ee.emit('once');
		ee.emit('once');

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

		ee.on('suspended', spy, context);

		ee.suspendEvents();
		ee.emit('suspended');

		expect(spy).not.toHaveBeenCalled();

		ee.resumeEvents();
		ee.emit('suspended');
		expect(spy).toHaveBeenCalled();
	});

	it('should stop emitting events if one handler returns false, also returning false.', function() {
		var calls = {
			one: false,
			two: false,
			three: false
		}

		ee.on('stop-emitting', function() {
			calls.one = true;
			return false;
		});

		ee.on('stop-emitting', function() {
			calls.two = true;
		});

		ee.on('stop-emitting', function() {
			calls.three = true;
		});

		var result = ee.emit('stop-emitting');

		expect(calls.one).toBe(true);
		expect(calls.two).toBe(false);
		expect(calls.three).toBe(false);
		expect(result).toBe(false);
	});
});
