var KickerModel = function(rendering, view, pubsub) {
	this.rendering = rendering;
	this.view = view;
	this.pubsub = pubsub;

	this.updateDimensions();

	pubsub.subscribe('trigger-recalc', this.updateDimensions.bind(this));
};

KickerModel.prototype.updateDimensions = function() {	
	this.height = parseFloat(this.view.getElement('height').value);
	this.width = parseFloat(this.view.getElement('width').value);
	this.angle = parseFloat(this.view.getElement('angle').value);

	this.radius = this.calculateRadius(this.height, this.angle);
	this.length = this.calculateLength(this.height, this.angle);
	this.arc = this.calculateArc(this.radius, this.angle);

	this.updateRepresentation();

	this.pubsub.publish("update-view", {
		'height': this.height,
		'width': this.width,
		'angle': this.angle,
		'radius': this.radius,
		'length': this.length,
		'arc': this.arc
	});
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

KickerModel.prototype.getRepresentation = function() {
	return this.representation;
};

KickerModel.prototype.updateRepresentation = function() {
	console.log('creating a representation');
	if (this.rendering == 'canvas') {
		this.representation = this.createCanvasRepresentation_();
	} else if (this.rendering == 'webgl') {
		this.representation = this.createWebGLRepresentation_();
	}
};

KickerModel.prototype.createCanvasRepresentation_ = function() {
  console.log('creating a canvas representation');
  var points = [];

  var angleRad = this.angle * Math.PI / 180;
  var steps = 20;
  var currentAngleRad, x, y;
  
  for (var i = 0; i < steps; i++) {
    currentAngleRad = i / steps * angleRad;
    x = this.radius * Math.sin(currentAngleRad);
    y = this.radius * (1 - Math.cos(currentAngleRad));
    points.push([x,y]);
  }
  points.push([x + .2, y]); 
  points.push([x + .2, 0]); 
  points.push([0, 0]); 

  // Returns a representation that is not scaled and needs to be flipped vertically.
  return new Representation2D(points);
};

KickerModel.prototype.createWebGLRepresentation_ = function() {
	console.log('creating a WebGL representation');
	var points = [];

	var angleRad = this.angle * Math.PI / 180;
	var steps = config.model3d.sides.steps;
	var currentAngleRad, x, y;

	for (var i = 0; i <= steps; i++) {
	currentAngleRad = i / steps * angleRad;
	x = this.radius * Math.sin(currentAngleRad);
	y = this.radius * (1 - Math.cos(currentAngleRad));
		points.push([x,y]);
	}
	points.push([x + .2, y]); 
	points.push([x + .2, 0]); 

	var defaultHeight = config.model3d.slats.defaultHeight;
	var minHeight = config.model3d.slats.minHeight;
	var thickness = config.model3d	.slats.thickness;

	var slats = [];
	var remainingArcLength = this.arc;
	var slat_height;
	while(remainingArcLength) {
		if (remainingArcLength > defaultHeight) {
			slat_height = defaultHeight;
		} else {
			if (remainingArcLength < minHeight) {
				remainingArcLength = 0;
				break;
			}
			slat_height = remainingArcLength;
		}
		remainingArcLength -= slat_height;
		slats.push(new Slat3D(this.width, slat_height, thickness));
	}

	return new Representation3D(points, slats, this.width);
};