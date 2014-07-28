var Slat = function(width, length, thickness, currentAngle, offset, imageList) {
	this.length = length;
	this.thickness = thickness;
	this.imageList = imageList;
	this.mesh = this.createMesh(width, length, thickness, 60);

	var angleRad = Math.PI * currentAngle / 180;
	this.mesh.rotateOnAxis(new THREE.Vector3(0, 0, 1), angleRad);
	this.mesh.position = offset;
};

Slat.prototype.createMesh = function(width, length, thickness, scale) {
	var geometry = this.buildGeometry(width, length, thickness, scale);
	var material = new THREE.MeshLambertMaterial({
        map: THREE.ImageUtils.loadTexture(this.imageList.getImageUrl('slat'))
    });
	var mesh = new THREE.Mesh(geometry, material);
	return mesh;
};

Slat.prototype.buildGeometry = function(width, length, thickness, scale) {
	var gap = config.model3d.slats.space;
	var x = (length - gap) * scale,
		y = thickness * scale
		z = width * scale;
	var geometry = new THREE.BoxGeometry(x, y, z);
	var offset = new THREE.Vector3(-x/2, y/2, 0);
	
	geometry.vertices.forEach(function(vertex) {
      vertex.add(offset);
	});	
	return geometry;
};