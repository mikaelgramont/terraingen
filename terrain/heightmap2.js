var HeightMap = function(size) {
	this.faultLineDisplacement_ = .1;
	this.size_ = size;
	this.map_ = new Float32Array(this.size_ * this.size_);
	for (var i = 0, l = this.map_.length; i < l; i++) {
		this.map_[i] = 0;
	}

	this.faultLines_ = [];
};

HeightMap.prototype.generateFaultLineParams = function() {
	for (var i = 0; i < 20; i++) {
		var p1 = this.pickRandomPoint_();
		var p2 = this.pickRandomPoint_();
		while (p1[0] == p2[0] && p1[1] == p2[1]) {
			p2 = pickRandomPoint();
		}
		var faultDir = [p1[0] - p2[0], p1[1] - p2[1]];
		this.faultLines_.push([p1, faultDir, this.faultLineDisplacement_]);
	}
	return this.faultLines_;
};

HeightMap.prototype.applyFaultLineParams = function(faultLineParams) {
	var applyFaultLine = this.applyFaultLine_.bind(this);
	faultLineParams.forEach(function(params) {
		var p1 = new THREE.Vector3(params[0][0], 0, params[0][1]);
		var faultDir = new THREE.Vector3(params[1][0], 0, params[1][1]);
		var inc = params[2];
		applyFaultLine(p1, faultDir, inc);
	});
};

HeightMap.prototype.applyFaultLine_ = function(p1, faultDir, inc) {
	for (var x = 0; x < this.size_; x++) {
		for (var z = 0; z < this.size_; z++) {
			var currentDir = new THREE.Vector3(
				x - p1.x,
				0,
				z - p1.z
			);
			var dot = currentDir.dot(faultDir);
			if (dot > 0) {
				this.map_[z + x * this.size_] += inc;
			}
		}
	}
};

HeightMap.prototype.blur = function(filter) {
	var map2 = new Float32Array(this.map_.length);
	for (var x = 0; x < this.size_; x++) {
		for (var z = 0; z < this.size_; z++) {
			var dividor;
			var sum;
			if (z == 0) {
				if (x == 0) {
					sum =
						this.map_[      z * this.size_ + x + 1] +
						this.map_[(z + 1) * this.size_ + x] + this.map_[(z + 1) * this.size_ + x + 1];
					dividor = 4;
				} else if (x == this.size_ - 1) {
					sum =
						this.map_[      z * this.size_ + x] +
						this.map_[(z + 1) * this.size_ + x - 1] + this.map_[(z + 1) * this.size_ + x];
					dividor = 4;
				} else {
					sum =
						this.map_[      z * this.size_ + x - 1] + this.map_[      z * this.size_ + x + 1] +
						this.map_[(z + 1) * this.size_ + x - 1] + this.map_[(z + 1) * this.size_ + x] + this.map_[(z + 1) * this.size_ + x + 1];
					dividor = 6;
				}
			} else if (z == this.size_ - 1) {
				if (x == 0) {
					sum =
						this.map_[(z - 1) * this.size_ + x] + this.map_[(z - 1) * this.size_ + x + 1] +
						this.map_[      z * this.size_ + x + 1];
					dividor = 4;
				} else if (x == this.size_ - 1) {
					sum =
						this.map_[(z - 1) * this.size_ + x - 1] + this.map_[(z - 1) * this.size_ + x] +
						this.map_[      z * this.size_ + x - 1];
					dividor = 4;
				} else {
					sum =
						this.map_[(z - 1) * this.size_ + x - 1] + this.map_[(z - 1) * this.size_ + x] + this.map_[(z - 1) * this.size_ + x + 1] +
						this.map_[      z * this.size_ + x - 1]  + this.map_[      z * this.size_ + x + 1];
					dividor = 6;
				}					
			} else {
				if (x == 0) {
					sum = 
						this.map_[(z - 1) * this.size_ + x] + this.map_[(z - 1) * this.size_ + x + 1] +
						this.map_[      z * this.size_ + x + 1] +
						this.map_[(z + 1) * this.size_ + x] + this.map_[(z + 1) * this.size_ + x + 1];
					dividor = 6;
				} else if (x == this.size_ - 1) {
					sum = 
						this.map_[(z - 1) * this.size_ + x - 1] + this.map_[(z - 1) * this.size_ + x] +
						this.map_[      z * this.size_ + x - 1] +
						this.map_[(z + 1) * this.size_ + x - 1] + this.map_[(z + 1) * this.size_ + x];
					dividor = 6;
				} else {
					sum =
						this.map_[(z - 1) * this.size_ + x - 1] + this.map_[(z - 1) * this.size_ + x] + this.map_[(z - 1) * this.size_ + x + 1] +
						this.map_[      z * this.size_ + x - 1] + this.map_[      z * this.size_ + x + 1] +
						this.map_[(z + 1) * this.size_ + x - 1] + this.map_[(z + 1) * this.size_ + x] + this.map_[(z + 1) * this.size_ + x + 1];
					dividor = 9;
				}
			}
			map2[z * this.size_ + x] = ((1 - filter) * this.map_[z * this.size_ + x] * dividor + filter * sum) / dividor;
		}
	}
	this.map_ = map2;;		
};

HeightMap.prototype.pickRandomPoint_ = function() {
	return [
		Math.round(Math.random() * this.size_),
		Math.round(Math.random() * this.size_)
	];
};

HeightMap.prototype.dumpToText = function(textEl) {
	var out = [];
	for (var x = 0; x < this.size_; x++) {
		for (var z = 0; z < this.size_; z++) {
			var str = this.map_[z + x * this.size_];
			out.push(str + ' '	);
		}
		out.push('\n');
	}
	textEl.value = out.join('');
};

HeightMap.prototype.dumpToCanvas = function(canvasEl) {
	var c = canvasEl.getContext('2d');
	var imageData = c.createImageData(this.size_, this.size_);
	var data = imageData.data;
	for (var z = 0; z < this.size_; z++) {
		for (var x = 0; x < this.size_; x++) {
			var mapIndex = x + z * this.size_;
			var color = this.map_[mapIndex] * 255 | 0;

			var pixelIndex = mapIndex * 4;
			data[pixelIndex] = color;		// r
			data[pixelIndex + 1] = color;	// g
			data[pixelIndex + 2] = color;	// b
			data[pixelIndex + 3] = 255;		// a
		}
	}
	c.putImageData(imageData, 0, 0);
};

HeightMap.prototype.applyBell = function(pow, scaleY) {
	var bell = function(x) {
		return Math.exp(pow * x) - 1;
	}
	for (var x = 0; x < this.size_; x++) {
		for (var z = 0; z < this.size_; z++) {
			var offsetX = x - this.size_ / 2;
			var offsetZ = z - this.size_ / 2;
			var dist = Math.sqrt(offsetX * offsetX + offsetZ * offsetZ	);
			var index = x + z * this.size_;
			this.map_[index] = bell(dist / this.size_) * scaleY;
		}
	}
};

HeightMap.prototype.shiftDown = function() {
	var min = Math.min.apply(null, this.map_);
	for (var x = 0; x < this.size_; x++) {
		for (var z = 0; z < this.size_; z++) {
			this.map_[x + z * this.size_] -= min;
		}
	}
};

HeightMap.prototype.createMeshGeometry = function(scaleVector) {
	var geometry = new THREE.PlaneGeometry(1.0, 1.0, this.size_ - 1, this.size_ - 1);
	for (var x = 0; x < this.size_; x++) {
		for (var z = 0; z < this.size_; z++) {
			var vertexX = x / this.size_ * scaleVector.x;
			var vertexY = this.map_[x + z * this.size_] * scaleVector.y;
			var vertexZ = z / this.size_ * scaleVector.z;
			geometry.vertices[x + z * this.size_] = new THREE.Vector3(
				vertexX,
				vertexY,
				vertexZ
			);
		}
	}

	// Offset all vertices so that the mesh is centered and flush with minY.
	geometry.computeBoundingBox();
	var boundingBox = geometry.boundingBox.clone();
	var xRange = boundingBox.max.x - boundingBox.min.x;
	var zRange = boundingBox.max.z - boundingBox.min.z;
	var offset = new THREE.Vector3(
		xRange / 2,
		0,
		zRange / 2);
	geometry.vertices.forEach(function(vertex) {
		vertex.sub(offset);
	});
	return geometry;
}

HeightMap.prototype.flattenCenterArea = function(size) {
	var startIndex = this.size_ / 2 - size / 2;
	var endIndex = this.size_ / 2 + size / 2;
	for (var x = startIndex; x < endIndex; x++) {
		for (var z = startIndex; z < endIndex; z++) {
			this.map_[x + z * this.size_] = 0;
		}
	}
};

HeightMap.prototype.getMaterial = function() {
	var repeatX	= 1;
	var repeatY	= 1;
	var anisotropy	= 16;

	// create the textureDiffuse	
	var textureDiffuseUrl	= './images/grasslight-small.jpg'
	var textureDiffuse	= THREE.ImageUtils.loadTexture(textureDiffuseUrl);
	textureDiffuse.wrapS	= THREE.RepeatWrapping;
	textureDiffuse.wrapT	= THREE.RepeatWrapping;
	textureDiffuse.repeat.x= repeatX
	textureDiffuse.repeat.y= repeatY
	textureDiffuse.anisotropy = anisotropy;

	// create the textureNormal	
	var textureNormalUrl	= './images/grasslight-small-nm.jpg'
	var textureNormal	= THREE.ImageUtils.loadTexture(textureNormalUrl);
	textureNormal.wrapS	= THREE.RepeatWrapping;
	textureNormal.wrapT	= THREE.RepeatWrapping;
	textureNormal.repeat.x	= repeatX
	textureNormal.repeat.y	= repeatY
	textureNormal.anisotropy= anisotropy;

	var material	= new THREE.MeshPhongMaterial({
		map		: textureDiffuse,
		normalMap	: textureNormal,
        normalScale	: new THREE.Vector2(1,1).multiplyScalar(0.5),
		color		: 0x44FF44,
		side: THREE.DoubleSide
	});
	return material;
}