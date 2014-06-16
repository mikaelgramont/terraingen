var PubSub = function() {
	this.subscribers = {};
};

PubSub.prototype.publish = function(eventName, data) {
	var subscribers = this.subscribers[eventName] || [];
	subscribers.forEach(function(callback) {
		callback(data);
	});
};

PubSub.prototype.subscribe = function(eventName, callback) {
	if (!this.subscribers[eventName]) {
		this.subscribers[eventName] = [];
	}

	this.subscribers[eventName].push(callback);
};