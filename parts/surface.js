var Surface = function(points, width, visibility, imageList) {
	this.points = points;
	this.width = width;
	this.imageList = imageList;
	this.mesh = this.createMesh(points, width);
	this.setVisible(visibility);
};
Surface.prototype = new Part();

Surface.prototype.createMesh = function(points, width) {
	var geometry = this.buildGeometry(points, width);
	var woodMap = THREE.ImageUtils.loadTexture(this.imageList.getImageUrl('side'));
	var material = new THREE.MeshLambertMaterial({
        map: woodMap
    });	
	var mesh = new THREE.Mesh(geometry, material);
	return mesh;
};

Surface.prototype.buildGeometry = function(points, width) {
	var rectShape = new THREE.Shape();
	var scale = 60;
	var thickness = config.model3d.surface.thickness;

	var i;
	var l = points.length;

	// Remove the last two points we don't need.
	points.splice(l - 2);

	// Duplicate the points, and offset them upwards.
	for (l = points.length - 1, i = l; i > 0; i--) {
		points.push([points[i][0], points[i][1] + thickness]);
	}

	rectShape.moveTo(points[0][0] * scale, points[0][1] * scale);
	for (i = 0, l = points.length; i < l; i++) {
		rectShape.lineTo(points[i][0] * scale, points[i][1] * scale);
	}

	var extrudeSettings = {
		amount: width * scale,
		bevelSize: 0,
		bevelSegments: 1,
		bevelThickness: 0
	};
	var geometry = new THREE.ExtrudeGeometry(rectShape, extrudeSettings);

	var offset = new THREE.Vector3(0, 0, - scale * width / 2);
	geometry.vertices.forEach(function(vertex) {
 		vertex.add(offset);
	});	

	Utils.setupUVMapping(geometry, 'z', 'y');

	return geometry;
};