
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

/********************************************************************
 * CANVAS RENDERER
 ********************************************************************/
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


/********************************************************************
 * WEBGL RENDERER
 ********************************************************************/
var WebGLRenderer = function(canvasEl) {
	this.canvasEl = canvasEl;
};

WebGLRenderer.prototype.canvasEl = null;

WebGLRenderer.prototype.camera = null;

WebGLRenderer.prototype.scene = null;

WebGLRenderer.prototype.threeRenderer = null;

WebGLRenderer.prototype.profile = null;

WebGLRenderer.prototype.mesh = null;

WebGLRenderer.prototype.render = function(profile) {
	console.log('WebGLRenderer - rendering', profile);

	this.profile = profile;
	this.init(profile);
	this.animate();
}

WebGLRenderer.prototype.init = function() {
	var aspectRatio = this.canvasEl.clientWidth / this.canvasEl.clientHeight;
	this.camera = new THREE.PerspectiveCamera(70, aspectRatio, 1, 1000);
	this.camera.position.x = 0;
	this.camera.position.y = 0;
	this.camera.position.z = 350;

	this.scene = new THREE.Scene();

	var light = new THREE.DirectionalLight(0xffffff);
	light.position.set(20, 100, 120);
	this.scene.add(light);

	this.threeRenderer = new THREE.WebGLRenderer({
		antialias: true,
		canvas: this.canvasEl
	});
	this.threeRenderer.setClearColor(0xf0f0f0);
	this.threeRenderer.setSize(
		this.canvasEl.clientWidth, this.canvasEl.clientHeight);	

	var basicMaterial =
 		new THREE.MeshLambertMaterial({color: 0xCC0000});
	this.mesh = new THREE.Mesh(
		this.buildGeometry(),
		basicMaterial
	);
	window.mesh = this.mesh;
	this.scene.add(this.mesh);
};

WebGLRenderer.prototype.buildGeometry = function() { 
	var rectShape = new THREE.Shape();
	var points = this.profile.getPoints();

    var scale = 50;
	rectShape.moveTo(points[0][0] * scale, points[0][1] * scale);
	for (var i = 1, l = points.length; i < l; i++) {
		rectShape.lineTo(points[i][0] * scale, points[i][1] * scale);
	}
    var out = rectShape.extractPoints();
    console.log('points', out);

	// rectShape.moveTo( 0,0 );
	// rectShape.lineTo( 0, 100 );
	// rectShape.lineTo( 50, 100 );
	// rectShape.lineTo( 50, 0 );
	// rectShape.lineTo( 0, 0 );
	var extrudeSettings = {
		amount: 2 * scale,
		bevelSize: 0,
		bevelSegments: 1,
		bevelThickness: 0
	}; // bevelSegments: 2, steps: 2 , bevelSegments: 5, bevelSize: 8, bevelThickness:5
	var geometry = new THREE.ExtrudeGeometry(rectShape, extrudeSettings);
	//THREEx.GeometryUtils.center(geometry);
  
 	// var geometry = new THREE.CubeGeometry(100, 100, 100);

 	return geometry;
};

WebGLRenderer.prototype.animate = function() {
	var animate = this.animate.bind(this);
	requestAnimationFrame(animate);

	this.mesh.rotation.y += .01;

	this.draw();
};

WebGLRenderer.prototype.draw = function() {
	// console.log('WebGLRenderer - drawing');
	this.threeRenderer.render(this.scene, this.camera);
};
