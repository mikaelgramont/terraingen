var KickerView = function(elements, pubsub) {
	this.elements = [];
	this.pubsub = pubsub;

	for (var name in elements) {
		if (elements.hasOwnProperty(name)) {
			this.elements[name] = document.getElementById(elements[name]);
		}
	}

	document.body.addEventListener("change", this.publishRecalc.bind(this));
};

KickerView.prototype.getElement = function(elName) {
	return this.elements[elName];
}

KickerView.prototype.publishRecalc = function(e) {
	if (e.target.classList.contains("trigger-recalc")) {
		this.pubsub.publish("trigger-recalc");
	}
};