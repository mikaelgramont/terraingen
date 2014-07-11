/********************************************************************
 * CANVAS RENDERER
 ********************************************************************/
var CanvasRenderer = function(canvasEl, representation) {
	this.type = 'canvas';
	this.representation = representation;
	this.canvasEl = canvasEl;
};

CanvasRenderer.prototype.render = function() {
  console.log('CanvasRenderer - rendering');

  var points = this.representation.getPoints();
  var context = this.canvasEl.getContext('2d');

  var padding = 20;
  var height = this.canvasEl.clientHeight;
  var width = this.canvasEl.clientWidth;

  context.clearRect(0, 0, width, height);

  height -= 2 * padding;
  width -= 2 * padding;
  
  context.strokeStyle = '#000000';
  context.fillStyle = "rgb(200,0,0)";
  context.lineWidth = 2;
  context.beginPath();

  // Since the curve starts on the ground, the base (x) is at least always
  // as long as the height (y). Hence finding the furthest x point lets us
  // figure out the smallest square needed to display the kicker.
  var maxX = 0;
  points.forEach(function(point) {
  	if (point[0] > maxX) {
  		maxX = point[0];
  	}
  });

  var scale;
  if (height > width) {
  	scale = height / maxX;
  } else {
  	scale = width / maxX;
  }

  var x, y, offsetX, offsetY;
  points.forEach(function(point) {
  	x = point[0] * scale + padding;
  	y = height - point[1] * scale + padding;

    context.lineTo(x, y);
  });
  context.fill();

  context.stroke();
  context.closePath();
}

CanvasRenderer.prototype.updateRepresentation = function(model) {
	this.representation = model.createCanvasRepresentation();
	this.render();
};
