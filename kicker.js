
var Kicker = function(model, pubsub) {
	this.model = model;
	this.pubsub = pubsub;

	this.pubsub.subscribe('trigger-recalc', this.updateRendererProfile.bind(this));
};

Kicker.prototype.updateRendererProfile = function() {
	this.renderer.updateProfile(this.model.getProfile());
};

Kicker.prototype.render = function() {
  console.log('kicker - rendering');
  this.renderer.render();
};