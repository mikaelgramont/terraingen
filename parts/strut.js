var Strut = function(width, thickness, currentAngle, offset, visibility, imageList) {
	this.length = length;
	this.thickness = thickness;
	this.imageList = imageList;
	this.mesh = this.createMesh(width, thickness);
	this.setVisible(visibility);

	var angleRad = 0;
	this.mesh.rotateOnAxis(new THREE.Vector3(0, 0, 1), angleRad);
	this.mesh.position = offset;
};
Strut.prototype = new Part();

Strut.prototype.createMesh = function(width, thickness) {
	var geometry = this.buildGeometry(width, thickness);
	var material = new THREE.MeshLambertMaterial({
        map: THREE.ImageUtils.loadTexture(this.imageList.getImageUrl('strut'))
    });
	var mesh = new THREE.Mesh(geometry, material);
	return mesh;
};

Strut.prototype.buildGeometry = function(width, thickness) {
	var x = thickness,
		y = thickness
		z = width;
	var geometry = new THREE.BoxGeometry(x, y, z);
	var offset = new THREE.Vector3(0, -y/2, 0);
	geometry.vertices.forEach(function(vertex) {
 		vertex.add(offset);
	});	
	return geometry;
};