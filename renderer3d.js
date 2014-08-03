/********************************************************************
 * WEBGL RENDERER
 ********************************************************************/
var WebGLRenderer = function(canvasEl, representation, pubsub) {
	this.canvasEl = canvasEl;
	this.representation = representation;
	this.pubsub = pubsub;
	this.parts = null;
	this.lookAtKicker = false;
	this.init();
	this.initPhysics();
	this.setupOrbitControl();

	// requestAnimationFrame id.
	this.rafId = null;

	this.pubsub.subscribe("stop-rendering", this.stop.bind(this));
	this.pubsub.subscribe("step-rendering", this.step.bind(this));
	this.pubsub.subscribe("resume-rendering", this.render.bind(this));
};

WebGLRenderer.prototype.initPhysics = function() {
	var world = new CANNON.World();
	world.defaultContactMaterial.contactEquationStiffness = 5e7;
	world.defaultContactMaterial.contactEquationRegularizationTime = 4;
	world.gravity.set(0, -9.81, 0);
	world.broadphase = new CANNON.NaiveBroadphase();
	world.solver.iterations = 10;
	world.solver.tolerance = 0;

	// Ground plane
	var groundShape = new CANNON.Plane();
	var groundBody = new CANNON.RigidBody(0, groundShape);
	groundBody.position = new CANNON.Vec3(0, 0, 0);
	// Need to rotate the plane as it is vertical by default.
	groundBody.quaternion.setFromAxisAngle(
	  new CANNON.Vec3(1, 0, 0), - Math.PI / 2);
	var groundMat = new CANNON.Material();
	groundBody.material = groundMat;
	world.add(groundBody);

	// Kicker Box
	var boxBody = Utils.createBoxBodyFromMesh(this.group, 20);
	boxBody.position = new CANNON.Vec3(0, 0, 0);
	// boxBody.quaternion.setFromAxisAngle(
	// 	new CANNON.Vec3(0,1,0), Math.PI / 180 * -15);
	var boxMat = new CANNON.Material();
	boxBody.material = boxMat;
	world.add(boxBody);

	// Materials
	var friction = 0.0;
	var restitution = 0;
	var kickerGroundContact = new CANNON.ContactMaterial(
		groundMat, boxMat, friction, restitution);
	kickerGroundContact.contactEquationStiffness = 1e10;
	kickerGroundContact.contactEquationRegularizationTime =3;	
	world.addContactMaterial(kickerGroundContact);

	this.boxBody = boxBody;
	Utils.makeAvailableForDebug('boxBody', this.boxBody);
	Utils.makeAvailableForDebug('groundBody', groundBody);
	this.world = world;

	var onCollision = this.setupOrbitControl.bind(this);
	boxBody.addEventListener("collide", function(e) {
		console.log("collision", e)
		onCollision();
	});
};


WebGLRenderer.prototype.render = function() {
	console.log('WebGLRenderer - rendering');
	if (!this.rafId) {
		this.animate();
	}
}

WebGLRenderer.prototype.stop = function() {
	console.log('WebGLRenderer - stopping rendering');
	cancelAnimationFrame(this.rafId);
	this.rafId = null;
}

WebGLRenderer.prototype.init = function() {
	var aspectRatio = this.canvasEl.clientWidth / this.canvasEl.clientHeight;
	this.camera = new THREE.PerspectiveCamera(50, aspectRatio, 1, 100);
	this.camera.position.x = 3;
	this.camera.position.y = 1.6;
	this.camera.position.z = 7;
	// window.camera = this.camera;

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

	this.setupGroup();

	this.scene.add(new THREE.AxisHelper(1));
	this.scene.add(new THREE.GridHelper(100,2));

	this.scene.add(new THREEx.GrassGround({
		width: 40,
		height: 40,
		repeatX: 8,
		repeatY: 8,
	}));
};

WebGLRenderer.prototype.setupOrbitControl = function() {
	if (this.orbitControls) {
		return;
	}
	this.lookAtKicker = false;
	this.orbitControls = new THREE.OrbitControls(this.camera, this.canvasEl);
}

WebGLRenderer.prototype.setupGroup = function() {
	this.group = new THREE.Object3D();
	this.scene.add(this.group);

	var parts = this.representation.getParts();
	Utils.iterateOverParts(parts, this.addPart.bind(this));
	
	var helper = new THREE.BoundingBoxHelper(this.group, 0);
	helper.update();
	var xOffset = - (helper.box.max.x + helper.box.min.x) / 2;
	var yOffset = - (helper.box.max.y + helper.box.min.y) / 2;

	Utils.iterateOverParts(parts, function(part) {
		part.mesh.translateX(xOffset);
		part.mesh.translateX(yOffset);
	});
	Utils.makeAvailableForDebug('group', this.group);
};

WebGLRenderer.prototype.addPart = function(part) {
	this.group.add(part.mesh);	
}

WebGLRenderer.prototype.animate = function() {
	var animate = this.animate.bind(this);
	this.rafId = requestAnimationFrame(animate);
	this.step();
};

WebGLRenderer.prototype.step = function() {
	//this.updatePhysics();
	this.draw();
};

WebGLRenderer.prototype.updatePhysics = function() {
	this.world.step(1/60);
	this.group.position = this.boxBody.position;
	this.group.quaternion = this.boxBody.quaternion;

	if (this.lookAtKicker) {
		this.camera.lookAt(this.group.position);
	}
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
