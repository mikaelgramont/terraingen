var Part = new Function();

Part.prototype.setVisible = function(visible) {
	if (!this.mesh) {
		return;
	}
	this.mesh.visible = visible;
};