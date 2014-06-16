var kickerApp = angular.module('kickerApp', []);


kickerApp.controller('DimensionsCtrl', function($scope) {
	$scope.height = 1;
	$scope.width = 0.8;
	$scope.angle = 40;
	$scope.radius = 0;
	$scope.length = 0;
});