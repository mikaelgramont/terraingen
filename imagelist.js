var ImageList = function() {
	this.images = {
		'wood': "./images/wood1_256.jpg"
	};
};

ImageList.prototype.getImageUrl = function(name) {
	return this.images[name];
};