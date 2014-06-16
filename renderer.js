
var Renderer = function(canvasEl, type, pubsub) {
	this.canvasEl = canvasEl;
	if (type == 'canvas') {
      this.rendererImpl = new CanvasRenderer(this.canvasEl, pubsub);
	} else if (type == 'webgl') {
      this.rendererImpl = new WebGLRenderer(this.canvasEl, pubsub);
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
var CanvasRenderer = function(canvasEl, pubsub) {
	this.canvasEl = canvasEl;
	this.pubsub = pubsub;
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
var WebGLRenderer = function(canvasEl, pubsub) {
	this.canvasEl = canvasEl;
	this.pubsub = pubsub;
};

WebGLRenderer.prototype.canvasEl = null;

WebGLRenderer.prototype.camera = null;

WebGLRenderer.prototype.scene = null;

WebGLRenderer.prototype.threeRenderer = null;

WebGLRenderer.prototype.profile = null;

WebGLRenderer.prototype.mesh = null;

WebGLRenderer.prototype.meshYRotation = null;

WebGLRenderer.prototype.render = function(profile) {
	console.log('WebGLRenderer - rendering', profile);

	this.profile = profile;
	this.init(profile);
	this.animate();
}

WebGLRenderer.prototype.init = function() {
	var aspectRatio = this.canvasEl.clientWidth / this.canvasEl.clientHeight;
	this.camera = new THREE.PerspectiveCamera(50, aspectRatio, 1, 1000);
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

	this.meshYRotation = Math.PI / 4;
	this.setMesh();

	// window.mesh = this.mesh;
	this.scene.add(this.mesh);
};

WebGLRenderer.prototype.setMesh = function(opt_profile) {
	if (opt_profile) {
		this.profile = opt_profile;
	}

	var basicMaterial =
 		new THREE.MeshLambertMaterial({color: 0xCC0000});
	this.mesh = new THREE.Mesh(
		this.buildGeometry(),
		basicMaterial
	);

	this.mesh.rotation.y = this.meshYRotation;
};

WebGLRenderer.prototype.buildGeometry = function() { 
	var rectShape = new THREE.Shape();
	var points = this.profile.getPoints();

    var scale = 60;
	rectShape.moveTo(points[0][0] * scale, points[0][1] * scale);
	for (var i = 1, l = points.length; i < l; i++) {
		rectShape.lineTo(points[i][0] * scale, points[i][1] * scale);
	}
	var extrudeSettings = {
		amount: 2 * scale,
		bevelSize: 0,
		bevelSegments: 1,
		bevelThickness: 0
	};
	var geometry = new THREE.ExtrudeGeometry(rectShape, extrudeSettings);

	// Center the geometry.
	geometry.computeBoundingBox();

	var middle = new THREE.Vector3()
	middle.x = (geometry.boundingBox.max.x + geometry.boundingBox.min.x) / 2;
	middle.y = (geometry.boundingBox.max.y + geometry.boundingBox.min.y) / 2;
	middle.z = (geometry.boundingBox.max.z + geometry.boundingBox.min.z) / 2;

    var delta = middle.negate();
	geometry.vertices.forEach(function(vertex) {
      vertex.add(delta);
	});

 	return geometry;
};

WebGLRenderer.prototype.animate = function() {
	var animate = this.animate.bind(this);
	requestAnimationFrame(animate);

	this.mesh.rotation.y = this.meshYRotation;
	this.draw();
	this.meshYRotation += .005;
};

WebGLRenderer.prototype.draw = function() {
	// console.log('WebGLRenderer - drawing');
	this.threeRenderer.render(this.scene, this.camera);
};