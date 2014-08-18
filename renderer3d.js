/********************************************************************
 * WEBGL RENDERER
 ********************************************************************/
var WebGLRenderer = function(canvasEl, representation, pubsub) {
	this.canvasEl = canvasEl;
	this.representation = representation;
	this.pubsub = pubsub;
	this.parts = null;
	this.lookAtKicker = true;
	this.init();
	this.initPhysics();

	// requestAnimationFrame id.
	this.rafId = null;

	this.pubsub.subscribe("stop-rendering", this.stop.bind(this));
	this.pubsub.subscribe("step-rendering", this.step.bind(this));
	this.pubsub.subscribe("resume-rendering", this.render.bind(this));
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
	this.camera.position.y = 3;
	this.camera.position.z = 8;

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

	this.scene.add(new THREE.AxisHelper(1));
	this.scene.add(new THREE.GridHelper(100,2));
	// this.scene.add(new THREEx.GrassGround({
	// 	width: 40,
	// 	height: 40,
	// 	repeatX: 8,
	// 	repeatY: 8,
	// }));

	// HEIGHTMAP
	var map = new HeightMap(64);
	map.applyFaultLineParams(
		map.generateFaultLineParams()
	);
	map.flattenCenterArea(12);
	map.blur(1);
	var planeGeometry = map.createMeshGeometry(new THREE.Vector3(50, 10, 50));
	var material = map.getMaterial();
	var plane = new THREE.Mesh(planeGeometry, material);
	// plane.position = new THREE.Vector3(-10, -10, 0);
	Utils.makeAvailableForDebug('map', plane);
	this.scene.add(plane);

	// CHARACTER
	var loader = new THREE.ColladaLoader();
	loader.options.convertUpAxis = true;

	var onDaeLoad = function (collada) {
		var dae = collada.scene;
		var skin = collada.skins[0];
		dae.position.set(0, 0, -2); //x,z,y- if you think in blender dimensions ;)
		dae.scale.set(1.0, 1.0, 1.0);
		this.scene.add(dae);
	}
	loader.load('simple_figure.dae', onDaeLoad.bind(this));

	this.setupGroup();	
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
	var boxBody = Utils.createBoxBodyFromMesh(this.group, 50);
	boxBody.position = new CANNON.Vec3(0, 3, 0);
	boxBody.velocity = new CANNON.Vec3(0, 0, 0);
	boxBody.quaternion.setFromAxisAngle(
	 	new CANNON.Vec3(0,.8,-.5), Math.PI / 180 * 35);
	var boxMat = new CANNON.Material();
	boxBody.material = boxMat;
	world.add(boxBody);

	// Materials
	var friction = 0.2;
	var restitution = .2;
	var kickerGroundContact = new CANNON.ContactMaterial(
		groundMat, boxMat, friction, restitution);
	kickerGroundContact.contactEquationStiffness = 1e6;
	kickerGroundContact.contactEquationRegularizationTime = 10;	
	world.addContactMaterial(kickerGroundContact);

	this.boxBody = boxBody;
	this.world = world;

	var onCollision = this.setupOrbitControl.bind(this);
	boxBody.addEventListener("collide", function(e) {
		console.log("collision", e)
		onCollision();
	});
	Utils.makeAvailableForDebug('boxBody', this.boxBody);
	Utils.makeAvailableForDebug('groundBody', groundBody);
};

WebGLRenderer.prototype.setupOrbitControl = function() {
	if (!this.lookAtKicker) {
		return;
	}
	this.lookAtKicker = false;
	this.orbitControls = new THREE.OrbitControls(this.camera, this.canvasEl);
	this.orbitControls.target = this.cameraTarget;
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
		part.mesh.translateY(yOffset);
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
	this.updatePhysics();
	this.draw();
};

WebGLRenderer.prototype.updatePhysics = function() {
	this.world.step(1/60);
	this.boxBody.position.copy(this.group.position);
	this.boxBody.quaternion.copy(this.group.quaternion);

	if (this.lookAtKicker) {
		this.cameraTarget = this.group.position.add(new THREE.Vector3(0,1,0));
		this.camera.lookAt(this.cameraTarget);
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
	this.initPhysics();
};
