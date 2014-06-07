
var Kicker = function(profile, renderer) {
	this.profile = profile;
	this.renderer = renderer;
};

// The profile (points).
Kicker.prototype.profile = null;

// The renderer object (canvas or webgl).
Kicker.prototype.renderer = null;

Kicker.prototype.render = function() {
  console.log('kicker - rendering');
  this.renderer.render(this.profile);
};