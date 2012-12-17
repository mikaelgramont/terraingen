var $height = $('#height'),
    $angle = $('#angle'),
    $radius = $('#radius'),
    $length = $('#length'),
    canvas = document.getElementById('canvas'),
    context = canvas.getContext('2d');

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

  $radius.html(radius);
  $length.html(length);

  draw(height, angle, radius, length);
}

function draw(height, angle, radius, length) {
  var canvasHeight = 600;
  var angleRad = angle * Math.PI / 180;
  var scale = 100;
  var steps = 20;
  var currentAngleRad, x, y;
  var scaledRadius = radius * scale;

  context.clearRect(0, 0, 800, 600);
  context.strokeStyle = '#000000';
  context.fillStyle = "rgb(200,0,0)";
  context.lineWidth = 2;
  context.beginPath();
  
  for (var i = 0; i < steps; i++) {
    currentAngleRad = i / steps * angleRad;
    x = scaledRadius * Math.sin(currentAngleRad);
    y = canvasHeight - scaledRadius * (1 - Math.cos(currentAngleRad));
    context.lineTo(x, y);
  } 
  context.lineTo(x + 20, y);
  context.lineTo(x + 20, canvasHeight);
  context.lineTo(0, canvasHeight);
  context.fill();

  context.stroke();
  context.closePath();
}
