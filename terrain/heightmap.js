// (function() {
	const SIZE = 16;
	var map = new Uint8Array(SIZE * SIZE, 128);
	initMap();
	generateMap(map);
	dumpMap(map);
	dumpHtmlMap(map);

	setTimeout(function() {
		blurMap(map);
		dumpMap(map);
		dumpHtmlMap(map);
	}, 2000);

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

	function blurMap(map) {
		filter = .25;
		// for (var i = 0; i < SIZE; i++)
		// 	blurDirection(map, i * SIZE, 1, SIZE, filter);

		// for (var i = 0; i < SIZE; i++)
		// 	blurDirection(map, i * SIZE + SIZE - 1, -1, SIZE, filter);

		for (var i = 0; i < SIZE; i++)
			blurDirection(map, i, SIZE, SIZE, filter);

		// for (var i = 0; i < SIZE; i++)
			// blurDirection(map, SIZE * SIZE - (SIZE - i), -SIZE, SIZE * i, filter);
	}

	function blurDirection(map, start, step, count, filter) {
		for (var i = 0; i < count - 1; i++) {
			var current = start + step * i;
			var next = current + step;
			map[current] = (1 - filter) * map[current] + map[next] * filter;
		}
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
		var out = [];
		for (var x = 0; x < SIZE; x++) {
			out.push('<ul class="row">')
			for (var z = 0; z < SIZE; z++) {
				var color = map[z + x * SIZE] + 256 * map[z + x * SIZE] + 256 * 256 * map[z + x * SIZE];
				out.push('<li class="cell" style="background-color:#' + color.toString(16) + ';"></li>')
			}
			out.push('</ul>')
		}
		document.getElementById('dumpHtml').innerHTML = out.join('');
	}	
// })();