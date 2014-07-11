/********************************************************************
 * WEBGL RENDERER
 ********************************************************************/
var WebGLRenderer = function(canvasEl, representation) {
	this.representation = representation;
	this.canvasEl = canvasEl;
	this.yRotation = Math.PI;
	this.parts = null;
	this.init();	
};

WebGLRenderer.prototype.render = function() {
	console.log('WebGLRenderer - rendering');

	this.animate();
}

WebGLRenderer.prototype.init = function() {
	var aspectRatio = this.canvasEl.clientWidth / this.canvasEl.clientHeight;
	this.camera = new THREE.PerspectiveCamera(50, aspectRatio, 1, 1000);
	this.camera.position.x = 0;
	this.camera.position.y = 0;
	this.camera.position.z = 350;

	this.scene = new THREE.Scene();

	var light = new THREE.DirectionalLight(0xffffff);
	light.position.set(20, 100, 120);
	this.scene.add(light);

	this.threeRenderer = new THREE.WebGLRenderer({
		antialias: true,
		canvas: this.canvasEl
	});
	this.threeRenderer.setClearColor(0xf0f0f0);
	this.threeRenderer.setSize(
	this.canvasEl.clientWidth, this.canvasEl.clientHeight);

	var parts = this.representation.getParts();
	this.group = new THREE.Object3D();
	for (var part in parts) {
	    if (parts.hasOwnProperty(part)) {
	        this.group.add(parts[part].mesh);
	    }
	}
	this.scene.add(this.group);
};

WebGLRenderer.prototype.animate = function() {
	var animate = this.animate.bind(this);
	requestAnimationFrame(animate);

	this.group.rotation.y = this.yRotation;
	this.draw();
	this.yRotation += .005;
};

WebGLRenderer.prototype.draw = function() {
	this.threeRenderer.render(this.scene, this.camera);
};

WebGLRenderer.prototype.updateRepresentation = function(model) {
	this.representation = model.createWebGLRepresentation(this.representation.imageList);
	this.render();
};
