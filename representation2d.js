var Representation2D = function(points) {
	this.points = points;
	console.log('Representation2D constructor', this);
};

Representation2D.prototype.getPoints = function() {
  return this.points;
}