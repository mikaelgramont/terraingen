var KickerModel = function(pubsub) {
	this.kicker = null;
	this.pubsub = pubsub;

	pubsub.subscribe('trigger-recalc', this.updateDimensions.bind(this));
};

KickerModel.prototype.setKicker = function(kicker) {
	this.kicker = kicker;
}

KickerModel.prototype.updateDimensions = function(dimensions) {	
	this.height = parseFloat(dimensions['height']);
	this.width = parseFloat(dimensions['width']);
	this.angle = parseFloat(dimensions['angle']);

	this.radius = this.calculateRadius(this.height, this.angle);
	this.length = this.calculateLength(this.height, this.angle);
	this.arc = this.calculateArc(this.radius, this.angle);

	this.pubsub.publish("update-view", {
		'height': this.height,
		'width': this.width,
		'angle': this.angle,
		'radius': this.radius,
		'length': this.length,
		'arc': this.arc
	});

	this.pubsub.publish('update-representations', this);
};

KickerModel.prototype.calculateRadius = function(h, alphaDeg) {
  var alphaRad = alphaDeg * Math.PI / 180,
      r = h / (1 - Math.cos(alphaRad));
  return r;
}

KickerModel.prototype.calculateLength = function(h, alphaDeg) {
  var alphaRad = alphaDeg * Math.PI / 180,
      l = h * Math.sin(alphaRad) / (1 - Math.cos(alphaRad));
  return l;    
}

KickerModel.prototype.calculateArc = function(radius, alphaDeg) {
  var arc = radius * alphaDeg * Math.PI / 180;
  return arc;
}

KickerModel.prototype.calculateSidePoints = function(angle, radius, config) {
	var points = [];

	var angleRad = angle * Math.PI / 180;
	var steps = config.model3d.sides.steps;
	var currentAngleRad, x, y;

	// The first point is calculated outside of the loop because it must
	// account for a minimum height of the sides, otherwise it looks too
	// 'perfect': you can't build something that thin.
	var minY = config.model3d.sides.minHeight;
	var minX = Math.acos(1 - minY / radius);
	points.push([minX, minY]); 

	for (var i = 0; i <= steps; i++) {
		currentAngleRad = i / steps * angleRad;
		x = radius * Math.sin(currentAngleRad);
		y = radius * (1 - Math.cos(currentAngleRad));
		if (x < minX) {
			x = minX;
		}
		if (y < minY) {
			y = minY;
		}
		points.push([x,y]);
	}
	var lastPointX = x + config.model3d.sides.extraLength;
	points.push([lastPointX, y]); 
	points.push([lastPointX, 0]); 

	return points;
};

KickerModel.prototype.createCanvasRepresentation = function() {
	var points = this.calculateSidePoints(this.angle, this.radius, config);

	// Need to close the shape for canvas.
	points.push([0,0]);
	// Returns a representation that is not scaled and needs to be flipped vertically.
	return new Representation2D(points);
};

KickerModel.prototype.createWebGLRepresentation = function(imageList) {
	console.log('creating a WebGL representation');
	var points = this.calculateSidePoints(this.angle, this.radius, config);
	return new Representation3D(points, this.length, this.angle, this.arc, this.radius, this.width, imageList, config);
};