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
	this.camera = new THREE.PerspectiveCamera(50, aspectRatio, 1, 1000);
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

	// HEIGHTMAP
	var mapSize = 64;
	var map = new HeightMap(mapSize);
	map.applyBell(0.89314, 2); //e=0.69314
	map.applyFaultLineParams(map.generateFaultLineParams());
	map.shiftDown();
	map.plateau({'x': mapSize / 4, 'z': mapSize / 4}, 6, .8);
	map.plateau({'x': mapSize * 3 / 8, 'z': mapSize * 3 / 8}, 6, .3);
	map.plateau({'x': mapSize / 2, 'z': mapSize / 2}, 6, .0);
	map.blur(.5);
	map.dumpToCanvas(document.getElementById('map-canvas'));
	var mapScale = new THREE.Vector3(180, 20, 180);
	var mapGeometry = map.createMeshGeometry(mapScale);
	var proceduralMaterial = map.getProceduralMaterial(
		document.getElementById('procedural-vertex-shader'),
		document.getElementById('procedural-fragment-shader')
	);
	var material = map.getMaterial();
	var heightMap = new THREE.Mesh(mapGeometry, proceduralMaterial);
	heightMap.scale.y = mapScale.y;
	Utils.makeAvailableForDebug('HeightMap', heightMap);
	Utils.makeAvailableForDebug('Map', map);
	this.scene.add(heightMap);

	// CHARACTER
	var loader = new THREE.ColladaLoader();
	loader.options.convertUpAxis = true;

	var onFigureLoaded = function (collada) {
		var dae = collada.scene;
		dae.scale.set(1.0, 1.0, 1.0);
		
		this.charGroup = new THREE.Object3D();
		this.charGroup.add(new THREE.AxisHelper(1));
		this.charGroup.add(dae);
		this.charGroup.position.set(0, 0, -2); //x,z,y- if you think in blender dimensions ;)
		this.scene.add(this.charGroup);
	}
	//loader.load('simple_figure.dae', onFigureLoaded.bind(this));

	var onBoardLoaded = function (collada) {
		var dae = collada.scene;
		dae.scale.set(1.0, 1.0, 1.0);
		
		this.boardGroup = new THREE.Object3D();
		this.boardGroup.add(dae);
		this.boardGroup.position.set(1, .23, 2.6); //x,z,y- if you think in blender dimensions ;)
		this.boardGroup.position.set(1.8, .127, -.8);
		this.boardGroup.scale.set(.55, .55, .55)
		this.boardGroup.rotateY(10 * Math.PI/64);
		this.scene.add(this.boardGroup);
		console.log('boardGroup', this.boardGroup);
		window.boardGroup = this.boardGroup;
	}
	loader.load('board.dae', onBoardLoaded.bind(this));

	this.setupGroup();	

	// this.leapController = new Leap.Controller({enableGestures: true});
	// this.leapController.on('frame', this.onLeapFrame.bind(this));
	// this.leapController.connect();
	// this.leapOutputEl = document.getElementById('leap-output');

};

WebGLRenderer.prototype.onLeapFrame = function(frame) {
	var output = [];
	frame.hands.forEach(function(hand) {
		if (hand.type != 'right') {
			return;
		}

		output.push('roll: ' + hand.roll() / Math.PI * 180);
		output.push('pitch :' + hand.pitch() / Math.PI * 180);
		output.push('yaw: ' + hand.yaw() / Math.PI * 180);
		output.push('grab strength: ' + hand.grabStrength);
		if (hand.grabStrength > 0.5) {
			if (!this.grabbing) {
				this.startGrabFrame = frame;
				this.grabbing = true;
			}
			output.push('grabbing since frame: ' + this.startGrabFrame.id);
			// TODO: remember which frame the initial grab happened along with
			// the object's rotation matrix then,
			// and add the current hand rotation since last frame to the object's
			// matrix.
			// var totalRotationZ = hand.rotationAngle(this.startGrabFrameId, [0,0,1]);
			// var rot = hand.rotationAxis(this.startGrabFrame);
			// this.charGroup.rotation = new THREE.Vector3(rot[0], rot[1], rot[2]);
			// output.push('rot: ' + Array.prototype.join.call(rot, '\n'));
			// console.log(rot);
			var rot = hand.rotationAngle(this.startGrabFrame, [1,0,0]);
			this.charGroup.rotation.y = - rot * 8;
			output.push('rot: ' + rot);

			// output.push('rot: ' + hand.rotationMatrix(this.startGrabFrameId).join(' '));
			// charGroup.rotation.x = hand.roll() * 4;
		} else {
			this.grabbing = false;
			this.startGrabFrame = null;
		}
		output.push('grabbing: ' + (this.grabbing ? 'yes' : 'no'));
	}, this);
	output = output.join('\n');
	this.leapOutputEl.innerHTML = output;

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
