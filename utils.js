var Utils = {};

Utils.setupUVMapping = function(geometry, u, v) {
	// Compute the UV mapping:
	// Go through all faces, and for each of their vertices,
	// calculate a Vector2 whose components are within [0,1].
	// This is done by dividing the positions of each vertice by the
	// 'length' of the shape in each dimension.
	// TODO: make sure this projects correctly on the extruded portions,
	//	most likely by inspecting the normal of the face first, and doing
	// a different calculation.

	if (typeof(u) == 'undefined') {
		u = 'x';
	}
	if (typeof(v) == 'undefined') {
		v = 'y';
	}

	var maxU = -Infinity,
		minU = Infinity,
		maxV = -Infinity,
		minV = Infinity,
		rangeU = 0,
		rangeV = 0;

	for (i = 0, l = geometry.vertices.length; i < l; i++) {

		if (maxU < geometry.vertices[i][u]) {
			maxU = geometry.vertices[i][u];
		}
		if (maxV < geometry.vertices[i][v]) {
			maxV = geometry.vertices[i][v];
		}
		if (minU > geometry.vertices[i][u]) {
			minU = geometry.vertices[i][u];
		}
		if (minV > geometry.vertices[i][v]) {
			minV = geometry.vertices[i][v];
		}
	}
	rangeU = maxU - minU;
	rangeV = maxV - minV;

	geometry.faceVertexUvs = [[]];
	for (i = 0, l = geometry.faces.length; i < l; i++) {
		var face = geometry.faces[i];
		var vertices = [
			geometry.vertices[face.a],
			geometry.vertices[face.b],
			geometry.vertices[face.c]
		];
		var mappedVertices = vertices.map(function(vertex) {
			return new THREE.Vector2((vertex[u] + rangeU / 2) / (2 * rangeU), vertex[v] / rangeV);
		});
	    geometry.faceVertexUvs[0].push(mappedVertices);
	}

};