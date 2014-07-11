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

	console.log('KickerModel.prototype.updateDimensions');
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

KickerModel.prototype.createCanvasRepresentation = function() {
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

KickerModel.prototype.createWebGLRepresentation = function(imageList) {
	console.log('creating a WebGL representation');
	return new Representation3D(this.angle, this.arc, this.radius, this.width, imageList, config);
};