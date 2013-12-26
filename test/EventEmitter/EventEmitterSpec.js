describe("EventEmitter", function () {

	it('should have methods to register, emit and remove events', function () {
		var ee = new EventEmitter();
		expect(ee.on).toBeFunction();
	});

});