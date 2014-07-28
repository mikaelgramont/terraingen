var App = function() {
};

// The renderer object (canvas or webgl)
App.prototype.renderer = null;

App.prototype.kickers = [];

App.prototype.addKicker = function(kicker) {
  console.log('app - adding a kicker');
  this.kickers.push(kicker);
}

App.prototype.getKickers = function() {
  return this.kickers;
}

App.prototype.render = function (){
  this.kickers.forEach(function(kicker) {
    kicker.render();
  });
}