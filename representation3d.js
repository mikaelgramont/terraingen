var Representation3D = function(points, length, angle, arc, radius, width, imageList, config) {
	this.parts = {};
	this.imageList = imageList;
	this.points = points;
	var offset = new THREE.Vector3(0, 0, width / 2);
	this.parts.sideR = new Side(this.points, offset, true, imageList);
	this.parts.sideL = new Side(this.points, offset.negate(), true, imageList);
	// this.parts.slats = this.buildSlats(width, angle, arc, radius);
	this.parts.struts = this.buildStruts(length, width, angle, arc, radius, true);
	this.parts.surface = this.buildSurface(this.points, width, true);
	Utils.makeAvailableForDebug('parts', this.parts);
};

Representation3D.prototype.getParts = function() {
	return this.parts;
};

Representation3D.prototype.buildStruts = function(length, width, angle, arc, radius, visibility) {
	var struts = [];
	var strutWidth = width;
	var strutsCount = Math.ceil(arc / config.model3d.struts.maximumDistance);
	var i = strutsCount;
	var smallStrutSide;
	var thickness = config.model3d.struts.side;

	// We need to move the struts back a bit so they sit flush with the end
	// of the ramp. 
	var offsetAngleRad = thickness / (2 * radius);

	while(i) {
		var currentAngle = angle * i / strutsCount;
		var currentAngleRad = currentAngle * Math.PI / 180 - offsetAngleRad;
		var x = radius * Math.sin(currentAngleRad);
		var y = radius * (1 - Math.cos(currentAngleRad));

		if (y < thickness) {
			// Use a smaller type of strut as the big ones don't fit.
			thickness = config.model3d.struts.smallSide;
		} 
		if (y < thickness) {
			// Can't fit anything anymore.
			break;
		} 

		var offset = new THREE.Vector3(0, 0, 0);
		var strut = new Strut(
			strutWidth, thickness, currentAngle, offset, visibility, this.imageList
		);
		strut.positionByAngle(radius, currentAngleRad);
		struts.push(strut);
		i--;
	}

	// Add two at the base.
	thickness = config.model3d.struts.side;
	offset = new THREE.Vector3(
		(length + config.model3d.sides.extraLength - thickness / 2),
		thickness,
		0
	);
	var strut = new Strut(
		strutWidth, thickness, 0, offset, visibility, this.imageList
	);
	strut.mesh.position = offset;
	struts.push(strut);
	offset = new THREE.Vector3(length * 2 / 3, thickness, 0);
	var strut = new Strut(
		strutWidth, thickness, 0, offset, visibility, this.imageList
	);
	strut.mesh.position = offset;
	struts.push(strut);

	return struts;
};

Representation3D.prototype.buildSurface = function(points, width, visibility) {
	var surfaceWidth = width + 2 * config.model3d.sides.thickness / 60;
	var surface = new Surface(points, surfaceWidth, visibility, this.imageList);
	return surface;	
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
	var angles = [];
	i = slatCount;
	while(i) {
		currentAngle = angle * i / slatCount;
		currentAngleRad = currentAngle * Math.PI / 180;
		angles.push(currentAngle);
		slatLength = defaultLength
		remainingArcLength -= slatLength;

		x = radius * Math.sin(currentAngleRad);
		y = radius * (1 - Math.cos(currentAngleRad));

		offset = new THREE.Vector3(x, y , 0);

		slats.push(new Slat(
			width + .125, slatLength, thickness, currentAngle, offset, this.imageList
		));
		i--;
	}
	return slats;
};