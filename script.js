var $heightValue = $('#height-value'),
    $height = $('#height'),
    $angleValue = $('#angle-value'),
    $angle = $('#angle'),
    $radiusValue = $('#radius-value'),
    $lengthValue = $('#length-value'),
    canvas = document.getElementById('canvas'),
    context = canvas.getContext('2d'),
    points = [];

$('#height, #angle').bind('change', update)
                    .bind('keyup', update);
update();

function calculateRadius(h, alphaDeg) {
  var alphaRad = alphaDeg * Math.PI / 180,
      r = h / (1 - Math.cos(alphaRad));
  return r;
}

function calculateLength(h, alphaDeg) {
  var alphaRad = alphaDeg * Math.PI / 180,
      l = h * Math.sin(alphaRad) / (1 - Math.cos(alphaRad));
  return l;    
}

function update() {
  var height = parseFloat($height.val()),
      angle = parseFloat($angle.val()),
      radius = calculateRadius(height, angle),
      length = calculateLength(height, angle);

  $radiusValue.html(radius.toFixed(2));
  $lengthValue.html(length.toFixed(2));
  $heightValue.html(height);
  $angleValue.html(angle);

  build(height, angle, radius, length);
  draw(points);
}

function build(height, angle, radius, length) {
  var canvasHeight = 600;
  var angleRad = angle * Math.PI / 180;
  var scale = 150;
  var steps = 20;
  var currentAngleRad, x, y;
  var scaledRadius = radius * scale;

  points = [];
  for (var i = 0; i < steps; i++) {
    currentAngleRad = i / steps * angleRad;
    x = scaledRadius * Math.sin(currentAngleRad);
    y = canvasHeight - scaledRadius * (1 - Math.cos(currentAngleRad));
    points.push([x,y]);
  }
  points.push([x + 20, y]); 
  points.push([x + 20, canvasHeight]); 
  points.push([0, canvasHeight]); 
}

function draw(profile) {
  context.clearRect(0, 0, 800, 600);
  context.strokeStyle = '#000000';
  context.fillStyle = "rgb(200,0,0)";
  context.lineWidth = 2;
  context.beginPath();
  for (var i = 0, l = profile.length; i < l; i++) {
    context.lineTo(profile[i][0], profile[i][1]);
  }
  context.fill();

  context.stroke();
  context.closePath();
}
