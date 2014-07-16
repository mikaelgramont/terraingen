var ImageList = function() {
	this.images = {
		'side': "./images/wood1_256.jpg",
		'slat': "./images/wood2_256.jpg"
	};
};

ImageList.prototype.getImageUrl = function(name) {
	return this.images[name];
};