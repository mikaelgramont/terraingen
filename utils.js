var Utils = {};

Utils.setupUVMapping = function(geometry) {
	// Compute the UV mapping:
	// Go through all faces, and for each of their vertices,
	// calculate a Vector2 whose components are within [0,1].
	// This is done by dividing the positions of each vertice by the
	// 'length' of the shape in each dimension.
	// TODO: make sure this projects correctly on the extruded portions,
	//	most likely by inspecting the normal of the face first, and doing
	// a different calculation.

	var maxX = -Infinity,
		minX = Infinity,
		maxY = -Infinity,
		minY = Infinity,
		rangeX = 0,
		rangeY = 0;

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

};