	
var Kicker = function(model, pubsub) {
	this.model = model;
	this.pubsub = pubsub;
	this.renderers = [];
	this.pubsub.subscribe('trigger-recalc', this.updateRendererRepresentations.bind(this));
};

Kicker.prototype.clearRenderers = function(renderer) {
	this.renderers = [];
	this.renderers.length = 0;
};

Kicker.prototype.addRenderer = function(renderer) {
	this.renderers.push(renderer);
};

Kicker.prototype.updateRendererRepresentations = function() {
	var model = this.model;
	this.renderers.forEach(function(renderer){
		renderer.updateRepresentation(model);
	});
};

Kicker.prototype.render = function() {
	console.log('kicker - rendering');
	this.renderers.forEach(function(renderer){
		renderer.render();
	});
};