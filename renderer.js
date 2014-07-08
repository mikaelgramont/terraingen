
var Renderer = function(representation, canvasEl, type, pubsub, imageList) {
	this.canvasEl = canvasEl;
	if (type == 'canvas') {
      this.rendererImpl = new CanvasRenderer(representation, this.canvasEl, pubsub);
	} else if (type == 'webgl') {
      this.rendererImpl = new WebGLRenderer(representation, this.canvasEl, pubsub, imageList);
	}
};

// Performs the rendering operation.
Renderer.prototype.render = function() {
  console.log('renderer - rendering');
  this.rendererImpl.render();
};

Renderer.prototype.updateRepresentation = function(representation) {
	this.rendererImpl.updateRepresentation(representation);
}

/********************************************************************
 * CANVAS RENDERER
 ********************************************************************/
var CanvasRenderer = function(representation, canvasEl, pubsub) {
	this.representation = representation;
	this.canvasEl = canvasEl;
	this.pubsub = pubsub;	
};

CanvasRenderer.prototype.updateRepresentation = function(representation) {
	this.representation = representation;
	this.render();
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


/********************************************************************
 * WEBGL RENDERER
 ********************************************************************/
var WebGLRenderer = function(representation, canvasEl, pubsub, imageList) {
	this.representation = representation;
	this.canvasEl = canvasEl;
	this.pubsub = pubsub;
	this.imageList = imageList;

	this.init();	
};

WebGLRenderer.prototype.render = function() {
	console.log('WebGLRenderer - rendering');

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

	this.meshYRotation = Math.PI;
	this.createMesh();
};

WebGLRenderer.prototype.updateRepresentation = function(representation) {
	this.representation = representation;
	this.scene.remove(this.mesh);
	this.createMesh();
};

WebGLRenderer.prototype.createMesh = function() {
	var geometry = this.buildGeometry();
	
	var woodMap = THREE.ImageUtils.loadTexture(this.imageList.getImageUrl('wood'));

	console.log('woodMap', woodMap);

	var material = new THREE.MeshLambertMaterial({
        map: woodMap
    });	
	this.mesh = new THREE.Mesh(geometry, material);

	this.mesh.rotation.y = this.meshYRotation;

	this.scene.add(this.mesh);	
};

WebGLRenderer.prototype.buildGeometry = function() { 
	//return new THREE.CubeGeometry(100, 100, 100);
	var i, l;
	const WALL_WIDTH = 2.0;

	var rectShape = new THREE.Shape();
	var points = this.representation.getPoints();

    var scale = 60;
	var maxX = -Infinity,
		minX = Infinity,
		maxY = -Infinity,
		minY = Infinity,
		rangeX = 0,
		rangeY = 0;

	rectShape.moveTo(points[0][0] * scale, points[0][1] * scale);
	for (i = 1, l = points.length; i < l; i++) {
		rectShape.lineTo(points[i][0] * scale, points[i][1] * scale);
	}

	var extrudeSettings = {
		amount: WALL_WIDTH,
		bevelSize: 0,
		bevelSegments: 1,
		bevelThickness: 0
	};
	var geometry = new THREE.ExtrudeGeometry(rectShape, extrudeSettings);

	// Compute the UV mapping:
	// Go through all faces, and for each of their vertices,
	// calculate a Vector2 whose components are within [0,1].
	// This is done by dividing the positions of each vertice by the
	// 'length' of the shape in each dimension.
	// TODO: make sure this projects correctly on the extruded portions,
	//	most likely by inspecting the normal of the face first, and doing
	// a different calculation.
	for (i = 0, l = geometry.vertices.length; i < l; i++) {

		if (maxX < geometry.vertices[i].x) {
			maxX = geometry.vertices[i].x;
		}
		if (maxY < geometry.vertices[i].y) {
			maxY = geometry.vertices[i].y;
		}
		if (minX > geometry.vertices[i].x) {
			minX = geometry.vertices[i].x;
		}
		if (minY > geometry.vertices[i].y) {
			minY = geometry.vertices[i].y;
		}
	}
	rangeX = maxX - minX;
	rangeY = maxY - minY;

	geometry.faceVertexUvs = [[]];
	for (i = 0, l = geometry.faces.length; i < l; i++) {
		var face = geometry.faces[i];
		var vertices = [
			geometry.vertices[face.a],
			geometry.vertices[face.b],
			geometry.vertices[face.c]
		];
		var mappedVertices = vertices.map(function(vertex) {
			return new THREE.Vector2(vertex.x / rangeX, vertex.y / rangeY);
		});
	    geometry.faceVertexUvs[0].push(mappedVertices);
	}

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