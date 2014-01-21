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
	var list = String(events).split(eventSplitRe);
	return list;
}

function getEventListeners(eventName) {
	var callbacks = this.$callbacks || (this.$callbacks = {});

	if (eventName) {
		return callbacks[eventName] || (callbacks[eventName] = []);
	}

	return callbacks;
}

function addListenerToEvent(eventConfig) {
	var callbacks = getEventListeners(eventConfig.name);

	delete eventConfig.name;
	callbacks.push(eventConfig);

	// TODO replace while(true) with while(i--)?

	return eventConfig;
}

function createListEventConfig(events, callback, context, params) {
	if (!(events && callback && typeof callback === 'function')) {
		return [];
	}

	var eventName, eventConfig, eventList = getEventNames(events),
		result = [];

	while (true) {
		eventName = eventList.shift();
		if (eventName === undefined) break;

		eventConfig = {
			name: eventName,
			callback: callback,
			context: context || null,
			params: params
		};

		result.push(eventConfig);
	}

	return result;
}

function getDefaultParams(args) {
	return args.length > 3 ? slice.call(args, 3) : false;
}

function addListeners(events, callback, context) {
	var params = getDefaultParams(arguments),
		listEventConfig = createListEventConfig(events, callback, context, params),
		eventConfig;

	while (true) {
		eventConfig = listEventConfig.shift();
		if (eventConfig === undefined) break;

		addListenerToEvent(eventConfig);
	}

	return function() {
		removeListeners(events, callback, context);
	};
}

function addOnceListeners(events, callback, context) {
	var params = getDefaultParams(arguments),
		listEventConfig = createListEventConfig(events, callback, context, params),
		eventConfig;

	while (true) {
		eventConfig = listEventConfig.shift();
		if (eventConfig === undefined) break;

		eventConfig.once = true;
		addListenerToEvent(eventConfig);
	}

	return function() {
		removeListeners(events, callback, context);
	};
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
		context = null;
	}

	for (; index < len; index++) {
		eventConfig = listenerList[index];

		if (callback === eventConfig.callback && (context === null || context === eventConfig.context)) {
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

	while (true) {
		eventName = eventList.shift();
		if (eventName === undefined) break;

		result = result && removeListenersOfName(eventName, callback, context);
	}

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

		if (eventConfig.once) {
			listeners.splice(index, 1);
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

	while (true) {
		eventName = eventList.shift();
		if (eventName === undefined) break;

		result = result && triggerEventsOfName(eventName, params);
	}

	return !!result;
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
	suspendEvents: function() {
		this.pauseEvents = true;
		return this;
	},

	/**
	 * Continue events
	 */
	resumeEvents: function() {
		this.pauseEvents = false;
		return this;
	}
};