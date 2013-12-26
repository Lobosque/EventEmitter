/**
 * Simple event emitter, cancellable with "return false" statement
 *
 * @class EventEmitter
 * @author Darlan Alves <darlan@moovia.com>
 */
function EventEmitter() {}

var slice = Array.prototype.slice,
	eventSplitRe = /\s+|,\s?/;

function getEventNames(events) {
	var list = String(events).split(eventSplitRe) || [];
	list.push('all');
	return list;
}

function getEventListeners(eventName) {
	var callbacks = this.$callbacks || (this.$callbacks = {});

	if (eventName) {
		return callbacks[eventName];
	}

	return callbacks;
}

function addListenerToEvent(eventName, callback, context) {
	var callbacks = getEventListeners(eventName),
		params = arguments.length > 3 ? slice.call(arguments, 3) : false;

	callbacks.push({
		callback: callback,
		context: context || this,
		params: params
	});
}

function addListeners(events, callback, context) {
	if (!(events && callback && typeof callback === 'function')) {
		return this;
	}

	var eventName, eventList = getEventNames(events);

	do {
		eventName = eventList.shift();
		addListenerToEvent(eventName, callback, context);
	} while (eventName !== undefined);

	return this;
}

function removeAllListenersOfName(eventName) {
	if (!(this.$callbacks && this.$callbacks[eventName])) {
		return false;
	}

	return delete this.$callbacks[eventName];
}

function removeListenersOfName(eventName, callback, context) {
	if (!callback) {
		return removeAllListenersOfName(eventName);
	}

	var listenerList = getEventListeners(eventName),
		index = 0,
		len = listenerList.length,
		eventConfig;

	if (context === undefined) {
		context = false;
	}

	for (; index < len; index++) {
		eventConfig = listenerList[index];

		if (callback === eventConfig.callback && (context === false || context === eventConfig.context)) {
			listenerList.splice(index, 1);
		}
	}

	return true;
}

function removeListeners(events, callback, context) {
	if (!(events || callback)) {
		delete this.$callbacks;
		return this;
	}

	var eventList = getEventNames(events),
		result = true,
		eventName;

	do {
		eventName = eventList.shift();
		result = result && removeListenersOfName(eventName, callback, context);
	} while (eventName !== undefined);

	return result;
}

function triggerEventsOfName(eventName, params) {
	var listeners = getEventListeners(eventName),
		len = listeners.length,
		paramsLen = params.length,
		result = true,
		index = 0,
		eventConfig, args;

	if (len === 0) {
		return true;
	}

	for (; index < len; index++) {
		eventConfig = listeners[index];
		args = [];

		if (eventConfig.params !== false) {
			args = args.concat(eventConfig.params);
		}

		if (paramsLen !== 0) {
			args = args.concat(params);
		}

		result = eventConfig.callback.apply(eventConfig.context, args);
		if (result === false) {
			break;
		}
	}

	return result;
}

function triggerEvents(events) {
	if (this.pauseEvents) {
		return this;
	}

	var eventList = getEventNames(events),
		result = true,
		params = arguments.length > 1 ? slice.call(arguments, 1) : [],
		eventName;

	do {
		eventName = eventList.shift();
		result = result && triggerEventsOfName(eventName, params);
	} while (eventName !== undefined);

	return !!result;
}

function addOnceListeners(events, callback, context) {
	var eventList = getEventNames(events),
		params = arguments.length > 3 ? slice.call(arguments, 3) : false,
		eventName,
		handler;

	context = context || this;

	function makeOnceHandler(eventName, callback, context, params) {
		return function () {
			var args = [];

			if (params !== false) {
				args = args.concat(params);
			}

			args.concat(arguments);

			removeListenersOfName(eventName, handler, context);
			callback.apply(context, args);
		};
	}

	do {
		eventName = eventList.shift();
		handler = makeOnceHandler(eventName, callback, context, params);
		addListenerToEvent(eventName, handler, context);
	} while (eventName !== undefined);
}

EventEmitter.prototype = {
	constructor: EventEmitter,

	pauseEvents: false,

	/**
	 * Returns the list of registered callbacks
	 * @return {Object}
	 */
	getListeners: getEventListeners,

	/**
	 * Remove all listeners of `events`
	 */
	clearListeners: removeListeners,

	/**
	 * Adds event listeners
	 * @param {String} events			Event name or names, e.g.'click save', or a special catch-all event name: `all`
	 * @param {Function} callback		Event callback
	 * @param {Object} context			Context where the callback should be called
	 * @param params...					Extra event arguments
	 */
	on: addListeners,

	/**
	 * Removes an event listener. The parameters must be identical to ones passed
	 * to {@link #addListener}
	 *
	 * @param {String} events
	 * @param {Function} callback
	 * @param {Object} context
	 */
	off: removeListeners,

	/**
	 * Event trigger
	 * @param {String} events
	 * @param params...
	 */
	emit: triggerEvents,

	/**
	 * Listen to an event and drop listener once it happens.
	 * This method follows the same rules of {@link #addListener}
	 * @param {String} ename        Event to bind
	 * @param {Function} fn         Event handler
	 * @param {Object} scope        Scope where the handler will be called
	 */
	once: addOnceListeners,

	/**
	 * Suspend events
	 */
	suspendEvents: function () {
		this.pauseEvents = true;
		return this;
	},

	/**
	 * Continue events
	 */
	resumeEvents: function () {
		this.pauseEvents = false;
		return this;
	}
};