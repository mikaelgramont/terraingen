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

	this.updateProfile();

	this.pubsub.publish("update-view", {
		'height': this.height,
		'width': this.width,
		'angle': this.angle,
		'radius': this.radius,
		'length': this.length,
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

KickerModel.prototype.getProfile = function() {
	return this.profile;
};

KickerModel.prototype.updateProfile = function() {
	console.log('creating a profile');
	if (this.rendering == 'canvas') {
		this.profile = this.createCanvasProfile_();
	} else if (this.rendering == 'webgl') {
		this.profile = this.createWebGLProfile_();
	}
};

KickerModel.prototype.createCanvasProfile_ = function() {
  console.log('creating a canvas profile');
  var points = [];

  var canvasHeight = 600;
  var angleRad = this.angle * Math.PI / 180;
  var scale = 150;
  var steps = 20;
  var currentAngleRad, x, y;
  var scaledRadius = this.radius * scale;

  for (var i = 0; i < steps; i++) {
    currentAngleRad = i / steps * angleRad;
    x = scaledRadius * Math.sin(currentAngleRad);
    y = canvasHeight - scaledRadius * (1 - Math.cos(currentAngleRad));
    points.push([x,y]);
  }
  points.push([x + 20, y]); 
  points.push([x + 20, canvasHeight]); 
  points.push([0, canvasHeight]); 

  return new Profile(points, this.width);
};

KickerModel.prototype.createWebGLProfile_ = function() {
  console.log('creating a WebGL profile');
  var points = [];

  var angleRad = this.angle * Math.PI / 180;
  var steps = 20;
  var currentAngleRad, x, y;

  for (var i = 0; i <= steps; i++) {
    currentAngleRad = i / steps * angleRad;
    x = this.radius * Math.sin(currentAngleRad);
    y = this.radius * (1 - Math.cos(currentAngleRad));
    points.push([x,y]);
  }
  points.push([x + .2, y]); 
  points.push([x + .2, 0]); 

  return new Profile(points, this.width);
};