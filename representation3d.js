var Representation3D = function(angle, arc, radius, width, imageList, config) {
	this.parts = {};
	this.imageList = imageList;
	this.points = this.calculateSidePoints(angle, radius, config);
	var offset = new THREE.Vector3(0, 0, width / 2 * 60);
		this.parts.sideL = new Side(this.points, offset, imageList);
		this.parts.sideR = new Side(this.points, offset.negate(), imageList);
	this.parts.slats = this.buildSlats(width, angle, arc, radius, imageList);
};

Representation3D.prototype.getParts = function() {
	return this.parts;
};

Representation3D.prototype.calculateSidePoints = function(angle, radius, config) {
	var points = [];

	var angleRad = angle * Math.PI / 180;
	var steps = config.model3d.sides.steps;
	var currentAngleRad, x, y;

	// The first point is calculated outside of the loop because it must
	// account for a minimum height of the sides, otherwise it looks too
	// 'perfect': you can't build something that thin.
	var minY = .02;
	var minX = Math.acos(1 - minY / radius);
	//points.push([minX, minY]); 

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

Representation3D.prototype.buildSlats = function(width, angle, arc, radius) {
	var defaultLength = config.model3d.slats.defaultLength;
	var minLength = config.model3d.slats.minLength;
	var thickness = config.model3d.slats.thickness;

	var slats = [];
	var currentSlat;
	var currentAngle = 0;
	var currentAngleRad;
	var remainingArcLength = arc;
	var slatCount = Math.ceil(remainingArcLength / defaultLength);
	var slatLength;
	var i = 0, x, y;
	var offset;
	var scale = 60;
	var angles = [];
	i = slatCount;
	while(i) {
		currentAngle = angle * i / slatCount;
		currentAngleRad = currentAngle * Math.PI / 180;
		angles.push(currentAngle);
		slatLength = defaultLength
		remainingArcLength -= slatLength;

		x = radius * Math.sin(currentAngleRad) * scale;
		y = radius * (1 - Math.cos(currentAngleRad)) * scale;

		offset = new THREE.Vector3(x, y , 0);

		slats.push(new Slat(
			width + .125, slatLength, thickness, currentAngle, offset, this.imageList
		));
		i--;
	}
	return slats;

	function buildSlat() {


	}
};