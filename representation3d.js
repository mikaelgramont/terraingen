var Representation3D = function(angle, arc, radius, width, imageList, config) {
	this.parts = {};
	this.imageList = imageList;
	this.points = this.calculateSidePoints(angle, radius, config);
	var offset = new THREE.Vector3(0, 0, width / 2 * 60);
	this.parts.sideL = new Side(this.points, offset, imageList);
	this.parts.sideR = new Side(this.points, offset.negate(), imageList);
	// this.parts.slats = this.buildSlats(angle, arc, radius);
};

Representation3D.prototype.getParts = function() {
	return this.parts;
};

Representation3D.prototype.calculateSidePoints = function(angle, radius, config) {
	var points = [];

	var angleRad = angle * Math.PI / 180;
	var steps = config.model3d.sides.steps;
	var currentAngleRad, x, y;

	for (var i = 0; i <= steps; i++) {
		currentAngleRad = i / steps * angleRad;
		x = radius * Math.sin(currentAngleRad);
		y = radius * (1 - Math.cos(currentAngleRad));
		points.push([x,y]);
	}
	points.push([x + .2, y]); 
	points.push([x + .2, 0]); 

	return points;
};

Representation3D.prototype.buildSlats = function(angle, arc, radius) {
	var defaultHeight = config.model3d.slats.defaultHeight;
	var minHeight = config.model3d.slats.minHeight;
	var thickness = config.model3d	.slats.thickness;

	var slats = [];
	var remainingArcLength = arc;
	var slatHeight;
	while(remainingArcLength) {
		if (remainingArcLength > defaultHeight) {
			slatHeight = defaultHeight;
		} else {
			if (remainingArcLength < minHeight) {
				remainingArcLength = 0;
				break;
			}
			slatHeight = remainingArcLength;
		}
		remainingArcLength -= slatHeight;
		slats.push(new Slat(width, slatHeight, thickness));
	}
	return slats;
};