	
var Kicker = function(model, pubsub) {
	this.model = model;
	this.pubsub = pubsub;
	this.renderers = [];
	this.pubsub.subscribe('trigger-recalc', this.updateRendererRepresentations.bind(this));
};

Kicker.prototype.clearRenderers = function() {
	this.renderers = [];
	this.renderers.length = 0;
};

Kicker.prototype.add3DRepresentation = function(canvasEl, imageList) {
	var representation = this.model.createWebGLRepresentation();
	var renderer = new WebGLRenderer(canvasEl, representation, imageList);
	this.renderers.push(renderer);
};

Kicker.prototype.add2DRepresentation = function(canvasEl) {
	var representation = this.model.createCanvasRepresentation();
	var renderer = new CanvasRenderer(canvasEl, representation);
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