var Side = function(points, offset, imageList) {
	this.points = points;
	this.imageList = imageList;
	this.mesh = this.createMesh(points, offset);
};

Side.prototype.createMesh = function(points, offset) {
	var geometry = this.buildGeometry(points, offset);
	
	var woodMap = THREE.ImageUtils.loadTexture(this.imageList.getImageUrl('side'));

	var material = new THREE.MeshLambertMaterial({
        map: woodMap
    });	
	var mesh = new THREE.Mesh(geometry, material);

	return mesh;
};

Side.prototype.buildGeometry = function(points, offset) { 
	var i, l;
	const WALL_WIDTH = 2.0;

	var rectShape = new THREE.Shape();

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

	// Center the geometry, and apply the offset.
	geometry.computeBoundingBox();

	var middle = new THREE.Vector3()
	// middle.x = (geometry.boundingBox.max.x + geometry.boundingBox.min.x) / 2;
	//middle.y = (geometry.boundingBox.max.y + geometry.boundingBox.min.y) / 2;
	// middle.z = (geometry.boundingBox.max.z + geometry.boundingBox.min.z) / 2;

    var delta = middle.negate().add(offset);
	geometry.vertices.forEach(function(vertex) {
      vertex.add(delta);
	});

 	return geometry;
};