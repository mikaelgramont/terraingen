var Profile = function(points, width) {
	this.points = points;
	this.width = width;

	console.log('Profile', this.points, this.width);
};

Profile.prototype.points = [];

Profile.prototype.width = null;

Profile.prototype.getPoints = function() {
  return this.points;
}