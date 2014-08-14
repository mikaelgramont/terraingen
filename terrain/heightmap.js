// (function() {
	const SIZE = 32;
	var map = new Uint8Array(SIZE * SIZE);
	initMap();
	generateMap(map);
	map = blurMap(map, parseFloat(document.getElementById('filter').value));
	dumpMap(map);
	dumpHtmlMap(map);

	document.getElementById('generate').addEventListener('click', function(e) {
		initMap();
		generateMap(map);
		dumpMap(map);
		dumpHtmlMap(map);
	});
	document.getElementById('filter').addEventListener('change', function(e) {
		var blurredMap = blurMap(map, parseFloat(e.target.value));
		dumpMap(blurredMap);
		dumpHtmlMap(blurredMap);
	});

	function generateMap(map) {
		for (var i = 0; i < 32; i++) {
			var p1 = pickRandomPoint();
			var p2 = pickRandomPoint();
			while (p1.x == p2.x && p1.z == p2.z) {
				p2 = pickRandomPoint();
			}
			var faultDir = new THREE.Vector3();
			faultDir.subVectors(p1, p2);
			addFaultLine(map, p1, faultDir, i);		
		}
	}

	function addFaultLine(map, p1, faultDir, inc) {
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
		var map2 = new Uint8Array(map.length);

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
		return new THREE.Vector3(
			Math.round(Math.random() * SIZE),
			0,
			Math.round(Math.random() * SIZE)
		);
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
				if (str < 10) {
					str = '0' + str;
				}
				if (str < 100) {
					str = '0' + str;
				}
				out.push(str + ' '	);
			}
			out.push('\n');
		}
		document.getElementById('dump').value = out.join('');
	}

	function dumpHtmlMap(map) {
		var canvas = document.getElementById('heightMap');
		var c = canvas.getContext('2d');
		var blockSize = 10;
		for (var x = 0; x < SIZE; x++) {
			for (var z = 0; z < SIZE; z++) {
				var color = map[z + x * SIZE];
				var imageData = c.createImageData(SIZE * blockSize, SIZE * blockSize);
				var data = imageData.data;
				for (var i = 0; i < 4 * SIZE * blockSize * SIZE * blockSize; i+=4) {
					data[i] = color;
					data[i + 1] = color;
					data[i + 2] = color;
					data[i + 3] = 255;
				}
				c.putImageData(imageData, z * blockSize, x * blockSize);
			}
		}
	}	
// })();