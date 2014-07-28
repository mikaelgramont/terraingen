	
var Kicker = function(model, pubsub) {
	this.model = model;
	this.pubsub = pubsub;
	this.renderers = [];
	this.pubsub.subscribe('trigger-recalc', this.updateRendererRepresentations.bind(this));
	this.pubsub.subscribe('trigger-redraw', this.redraw.bind(this));
};

Kicker.prototype.clearRenderers = function() {
	this.renderers = [];
	this.renderers.length = 0;
};

Kicker.prototype.add3DRepresentation = function(canvasEl, imageList) {
	var representation = this.model.createWebGLRepresentation(imageList);
	var renderer = new WebGLRenderer(canvasEl, representation, this.pubsub);
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

Kicker.prototype.redraw = function(params) {
	this.renderers.forEach(function(renderer){
		if (!renderer.redraw) {
			return;
		}
		renderer.redraw(params.visibility);
	});
};

Kicker.prototype.render = function() {
	console.log('kicker - rendering');
	this.renderers.forEach(function(renderer){
		renderer.render();
	});
};