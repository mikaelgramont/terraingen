var Strut = function(width, thickness, currentAngle, offset, imageList) {
	this.length = length;
	this.thickness = thickness;
	this.imageList = imageList;
	this.mesh = this.createMesh(width, thickness, 60);

	var angleRad = 0;
	this.mesh.rotateOnAxis(new THREE.Vector3(0, 0, 1), angleRad);
	this.mesh.position = offset;
};

Strut.prototype.createMesh = function(width, thickness, scale) {
	var geometry = this.buildGeometry(width, thickness, scale);
	var material = new THREE.MeshLambertMaterial({
        map: THREE.ImageUtils.loadTexture(this.imageList.getImageUrl('strut'))
    });
	var mesh = new THREE.Mesh(geometry, material);
	return mesh;
};

Strut.prototype.buildGeometry = function(width, thickness, scale) {
	var x = thickness * scale,
		y = thickness * scale
		z = width * scale;
	var geometry = new THREE.BoxGeometry(x, y, z);
	var offset = new THREE.Vector3(0, -y/2, 0);
	geometry.vertices.forEach(function(vertex) {
 		vertex.add(offset);
	});	
	return geometry;
};