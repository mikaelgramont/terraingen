var KickerView = function(elements, pubsub) {
	this.elements = [];
	this.visElements = {};
	this.pubsub = pubsub;

	for (var name in elements) {
		if (elements.hasOwnProperty(name)) {
			var element = document.getElementById(elements[name]);
			if (element.classList.contains("update-on-change")) {
				this.visElements[name] = element;
			} else {
				this.elements[name] = element;
			}
		}
	}

	document.body.addEventListener("change", this.onChange.bind(this));

	this.pubsub.subscribe("update-view", this.updateView.bind(this));
};

KickerView.prototype.getElement = function(elName) {
	return this.elements[elName];
}

KickerView.prototype.updateView = function(updates) {
	for (var name in updates) {
		var element = this.visElements[name + "Label"];
		if (!element) {
			continue;
		}
		element.innerHTML = updates[name].toFixed(2);
	}
};

KickerView.prototype.onChange = function(e) {
	if (e.target.classList.contains("trigger-recalc")) {
		this.pubsub.publish("trigger-recalc");
	}
};