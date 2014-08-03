var Side = function(points, offset, visibility, imageList) {
	this.points = points;
	this.imageList = imageList;
	this.mesh = this.createMesh(points, offset);
	this.setVisible(visibility);
};
Side.prototype = new Part();

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
	var rectShape = new THREE.Shape();

	rectShape.moveTo(points[0][0], points[0][1]);
	for (i = 1, l = points.length; i < l; i++) {
		rectShape.lineTo(points[i][0], points[i][1]);
	}

	var extrudeSettings = {
		amount: config.model3d.sides.thickness,
		bevelSize: 0,
		bevelSegments: 1,
		bevelThickness: 0
	};
	var geometry = new THREE.ExtrudeGeometry(rectShape, extrudeSettings);

	Utils.setupUVMapping(geometry);

	// Compensate for the extrusion amount, and move the whole shape by offset.
	var delta = new THREE.Vector3();
	delta.z = - config.model3d.sides.thickness / 2;
    delta = delta.add(offset);
	geometry.vertices.forEach(function(vertex) {
      vertex.add(delta);
	});
	return geometry;
};