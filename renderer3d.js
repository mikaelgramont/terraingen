/********************************************************************
 * WEBGL RENDERER
 ********************************************************************/
var WebGLRenderer = function(canvasEl, representation, pubsub) {
	this.canvasEl = canvasEl;
	this.representation = representation;
	this.pubsub = pubsub;
	this.yRotation = Math.PI;
	this.parts = null;
	this.init();

	// requestAnimationFrame id.
	this.rafId = null;

	this.pubsub.subscribe("stop-rendering", this.stop.bind(this));
	this.pubsub.subscribe("resume-rendering", this.render.bind(this));
};

WebGLRenderer.prototype.render = function() {
	console.log('WebGLRenderer - rendering');
	if (!this.rafId) {
		this.animate();
	}
}

WebGLRenderer.prototype.stop = function() {
	console.log('WebGLRenderer - rendering');
	cancelAnimationFrame(this.rafId);
	this.rafId = null;
}

WebGLRenderer.prototype.init = function() {
	var aspectRatio = this.canvasEl.clientWidth / this.canvasEl.clientHeight;
	this.camera = new THREE.PerspectiveCamera(50, aspectRatio, 1, 1000);
	this.camera.position.x = 0;
	this.camera.position.y = 0;
	this.camera.position.z = 350;

	this.scene = new THREE.Scene();

	var light = new THREE.DirectionalLight(0xffffff);
	light.position.set(300, 10, 300);
	this.scene.add(light);

	var light2 = new THREE.DirectionalLight(0xffffff);
	light2.position.set(-100, 200, -120);
	this.scene.add(light2);

	this.threeRenderer = new THREE.WebGLRenderer({
		antialias: true,
		canvas: this.canvasEl
	});
	this.threeRenderer.setClearColor(0xf0f0f0);
	this.threeRenderer.setSize(
	this.canvasEl.clientWidth, this.canvasEl.clientHeight);

	this.orbitControls = new THREE.OrbitControls(this.camera, this.canvasEl);

	this.setupGroup();

	this.scene.add(new THREE.AxisHelper(120));
	this.scene.add(new THREE.GridHelper(100,10));
};

	
WebGLRenderer.prototype.setupGroup = function() {
	var parts = this.representation.getParts();
	this.group = new THREE.Object3D();

	var addSubPart = function(subPart) {
		this.group.add(subPart.mesh);	
	}
	for (var part in parts) {
	    if (parts.hasOwnProperty(part)) {
	    	if (Array.isArray(parts[part])) {
	    		parts[part].forEach(this.addPart.bind(this));
	    	} else {
		        this.addPart(parts[part]);
		    }
	    }
	}
	this.scene.add(this.group);
	// window.group = this.group;
	
	var helper = new THREE.BoundingBoxHelper(this.group, 0);
	helper.update();
	var xOffset = (helper.box.max.x - helper.box.min.x) / 2;
	this.group.translateX(xOffset);
};

WebGLRenderer.prototype.addPart = function(part) {
	this.group.add(part.mesh);	
}

WebGLRenderer.prototype.animate = function() {
	var animate = this.animate.bind(this);
	this.rafId = requestAnimationFrame(animate);

	this.group.rotation.y = this.yRotation;
	this.draw();
	//this.yRotation += .005;
};

WebGLRenderer.prototype.draw = function() {
	this.threeRenderer.render(this.scene, this.camera);
};

WebGLRenderer.prototype.redraw = function(partVisibilities) {
	var parts = this.representation.getParts();
	for (var partIndex in partVisibilities) {
	    if (parts.hasOwnProperty(partIndex)) {
	    	if (Array.isArray(parts[partIndex])) {
	    		parts[partIndex].forEach(function(part) {
	    			part.setVisible(partVisibilities[partIndex])
	    		});
	    	} else {
		        parts[partIndex].setVisible(partVisibilities[partIndex]);
		    }
	    }
	}
};

WebGLRenderer.prototype.updateRepresentation = function(model) {
	this.representation = model.createWebGLRepresentation(this.representation.imageList);
	this.scene.remove(this.group);
	this.setupGroup();
};
