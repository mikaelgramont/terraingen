// (function() {
	/**
		TODO: create a function that takes a bunch of parameters to drive the fault
		line generation, so the terrain creation becomes deterministic by passing
		in a bunch of fault line vectors and a filter param.
		Also needs to output the params output by the terrain generation.
		That way this file can get included and actual 3d terrain can be generated.
	*/
	const SIZE = 64;
	var map = new Float32Array(SIZE * SIZE);
	initMap();
	generateMap(map);
	map = blurMap(map, parseFloat(document.getElementById('filter').value));
	dumpMap(map);
	dumpCanvasMap(map);

	document.getElementById('generate').addEventListener('click', function(e) {
		initMap();
		generateMap(map);
		map = blurMap(map, parseFloat(document.getElementById('filter').value));
		dumpMap(map);
		dumpCanvasMap(map);
	});
	document.getElementById('filter').addEventListener('change', function(e) {
		var blurredMap = blurMap(map, parseFloat(e.target.value));
		dumpMap(blurredMap);
		dumpCanvasMap(blurredMap);
	});

	function generateMap(map) {
		var faultLines = [];
		// High start value makes for a low minimum ground level.
		for (var i = 0; i < 20; i++) {
			var p1 = pickRandomPoint();
			var p2 = pickRandomPoint();
			while (p1[0] == p2[0] && p1[1] == p2[1]) {
				p2 = pickRandomPoint();
			}
			var faultDir = [p1[0] - p2[0], p1[1] - p2[1]];
			faultLines.push([p1, faultDir, .05]);
		}
		var faultLineParams = [];
		faultLines.forEach(function(faultLine) {
			faultLineParams.push(faultLine);
			var p1 = new THREE.Vector3(faultLine[0][0], 0, faultLine[0][1]);
			var faultDir = new THREE.Vector3(faultLine[1][0], 0, faultLine[1][1]);
			var inc = faultLine[2];
			applyFaultLine(map, p1, faultDir, inc);
		});
		document.getElementById('params').value = faultLineParams.join('\n');
	}

	function applyFaultLine(map, p1, faultDir, inc) {
		for (var x = 0; x < SIZE; x++) {
			for (var z = 0; z < SIZE; z++) {
				var currentDir = new THREE.Vector3(
					x - p1.x,
					0,
					z - p1.z
				);
				var dot = currentDir.dot(faultDir);
				if (dot > 0) {
					map[z + x * SIZE] += inc;
				}
			}
		}
	}

	function blurMap(map, filter) {
		var map2 = new Float32Array(map.length);

		for (var x = 0; x < SIZE; x++) {
			for (var z = 0; z < SIZE; z++) {
				var dividor;
				var sum;
				if (z == 0) {
					if (x == 0) {
						sum =
							map[      z * SIZE + x + 1] +
							map[(z + 1) * SIZE + x] + map[(z + 1) * SIZE + x + 1];
						dividor = 4;
					} else if (x == SIZE - 1) {
						sum =
							map[      z * SIZE + x] +
							map[(z + 1) * SIZE + x - 1] + map[(z + 1) * SIZE + x];
						dividor = 4;
					} else {
						sum =
							map[      z * SIZE + x - 1] + map[      z * SIZE + x + 1] +
							map[(z + 1) * SIZE + x - 1] + map[(z + 1) * SIZE + x] + map[(z + 1) * SIZE + x + 1];
						dividor = 6;
					}
				} else if (z == SIZE - 1) {
					if (x == 0) {
						sum =
							map[(z - 1) * SIZE + x] + map[(z - 1) * SIZE + x + 1] +
							map[      z * SIZE + x + 1];
						dividor = 4;
					} else if (x == SIZE - 1) {
						sum =
							map[(z - 1) * SIZE + x - 1] + map[(z - 1) * SIZE + x] +
							map[      z * SIZE + x - 1];
						dividor = 4;
					} else {
						sum =
							map[(z - 1) * SIZE + x - 1] + map[(z - 1) * SIZE + x] + map[(z - 1) * SIZE + x + 1] +
							map[      z * SIZE + x - 1]   + map[      z * SIZE + x + 1];
						dividor = 6;
					}					
				} else {
					if (x == 0) {
						sum = 
							map[(z - 1) * SIZE + x] + map[(z - 1) * SIZE + x + 1] +
							map[      z * SIZE + x + 1] +
							map[(z + 1) * SIZE + x] + map[(z + 1) * SIZE + x + 1];
						dividor = 6;
					} else if (x == SIZE - 1) {
						sum = 
							map[(z - 1) * SIZE + x - 1] + map[(z - 1) * SIZE + x] +
							map[      z * SIZE + x - 1] +
							map[(z + 1) * SIZE + x - 1] + map[(z + 1) * SIZE + x];
						dividor = 6;
					} else {
						sum =
							map[(z - 1) * SIZE + x - 1] + map[(z - 1) * SIZE + x] + map[(z - 1) * SIZE + x + 1] +
							map[      z * SIZE + x - 1] + map[      z * SIZE + x + 1] +
							map[(z + 1) * SIZE + x - 1] + map[(z + 1) * SIZE + x] + map[(z + 1) * SIZE + x + 1];
						dividor = 9;
					}
				}
				map2[z * SIZE + x] = ((1 - filter) * map[z * SIZE + x] * dividor + filter * sum) / dividor;
			}
		}
		return map2;	
	}

	// Returns a random vertex in the grid
	function pickRandomPoint() {
		return [
			Math.round(Math.random() * SIZE),
			Math.round(Math.random() * SIZE)
		];
	}

	function initMap() {
		for (var i = 0; i < SIZE * SIZE; i++) {
			map[i] = 0;
		}		
	}

	function dumpMap(map) {
		var out = [];
		for (var x = 0; x < SIZE; x++) {
			for (var z = 0; z < SIZE; z++) {
				var str = map[z + x * SIZE];
				out.push(str + ' '	);
			}
			out.push('\n');
		}
		document.getElementById('dump').value = out.join('');
	}

	function dumpCanvasMap(map) {
		var canvas = document.getElementById('heightMap');
		var c = canvas.getContext('2d');
		var imageData = c.createImageData(SIZE, SIZE);
		var data = imageData.data;
		for (var z = 0; z < SIZE; z++) {
			for (var x = 0; x < SIZE; x++) {
				var mapIndex = x + z * SIZE;
				var color = map[mapIndex] * 255 | 0;

				var pixelIndex = mapIndex * 4;
				data[pixelIndex] = color;		// r
				data[pixelIndex + 1] = color;	// g
				data[pixelIndex + 2] = color;	// b
				data[pixelIndex + 3] = 255;		// a
			}
		}
		c.putImageData(imageData, 0, 0);
	}	
// })();