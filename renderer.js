
var Renderer = function(canvasEl, type) {
	this.canvasEl = canvasEl;
	if (type == 'canvas') {
      this.rendererImpl = new CanvasRenderer(this.canvasEl);
	} else if (type == 'webgl') {
      this.rendererImpl = new WebGLRenderer(this.canvasEl);
	}
};

// The target canvas element.
Renderer.prototype.canvasEl = null;

// The actual renderer implementation.
Renderer.prototype.rendererImpl = null;

// Performs the rendering operation.
Renderer.prototype.render = function(profile) {
  console.log('renderer - rendering');
  this.rendererImpl.render(profile);
};



var CanvasRenderer = function(canvasEl) {
	this.canvasEl = canvasEl;
};

CanvasRenderer.prototype.canvasEl = null;

CanvasRenderer.prototype.render = function(profile) {
  console.log('CanvasRenderer - rendering', profile);

  var points = profile.getPoints();
  var context = this.canvasEl.getContext('2d');

  context.clearRect(0, 0, 800, 600);
  context.strokeStyle = '#000000';
  context.fillStyle = "rgb(200,0,0)";
  context.lineWidth = 2;
  context.beginPath();

  for (var i = 0, l = points.length; i < l; i++) {
    context.lineTo(points[i][0], points[i][1]);
  }
  context.fill();

  context.stroke();
  context.closePath();
}



var WebGLRenderer = function(canvasEl) {
	this.canvasEl = canvasEl;
};

WebGLRenderer.prototype.canvasEl = null;

WebGLRenderer.prototype.render = function(profile) {
  console.log('WebGLRenderer - rendering', profile);
}