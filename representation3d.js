var Representation3D = function(length, angle, arc, radius, width, imageList, config) {
	this.parts = {};
	this.imageList = imageList;
	this.points = this.calculateSidePoints(angle, radius, config);
	var offset = new THREE.Vector3(0, 0, width / 2 * 60);
	this.parts.sideL = new Side(this.points, offset, imageList);
	this.parts.sideR = new Side(this.points, offset.negate(), imageList);
	// this.parts.slats = this.buildSlats(width, angle, arc, radius,);
	this.parts.struts = this.buildStruts(length, width, angle, arc, radius);
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
	var lastPointX = x + config.model3d.sides.extraLength;
	points.push([lastPointX, y]); 
	points.push([lastPointX, 0]); 

	return points;
};

Representation3D.prototype.buildStruts = function(length, width, angle, arc, radius) {
	// Build a list of {x,z,rotation}
	var scale = 60;
	var struts = [];
	var strutWidth = width;
	var strutsCount = Math.ceil(arc / config.model3d.struts.maximumDistance);
	var i = strutsCount;
	var smallStrutSide 
	while(i) {
		var thickness = config.model3d.struts.side;
		var currentAngle = angle * i / strutsCount;
		var currentAngleRad = currentAngle * Math.PI / 180;
		var x = radius * Math.sin(currentAngleRad) * scale;
		var y = radius * (1 - Math.cos(currentAngleRad)) * scale;

		if (y < thickness * scale) {
			// Use a smaller type of strut as the big ones don't fit.
			thickness = config.model3d.struts.smallSide;
		} 
		if (y < thickness * scale) {
			// Can't fit anything anymore.
			break;
		} 

		var offset = new THREE.Vector3(x, y, 0);
		var strut = new Strut(
			strutWidth, thickness, currentAngle, offset, this.imageList
		);
		strut.mesh.rotation.z = currentAngleRad;
		strut.mesh.position.y -= currentAngleRad;
		struts.push(strut);
		i--;
	}

	// Add two at the base.
	thickness = config.model3d.struts.side;
	offset = new THREE.Vector3(
		(length + config.model3d.sides.extraLength - thickness / 2) * scale,
		thickness * scale,
		0
	);
	var strut = new Strut(
		strutWidth, thickness, 0, offset, this.imageList
	);
	struts.push(strut);
	offset = new THREE.Vector3(length * scale * 2 / 3, thickness * scale, 0);
	var strut = new Strut(
		strutWidth, thickness, 0, offset, this.imageList
	);
	struts.push(strut);

	return struts;
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
};