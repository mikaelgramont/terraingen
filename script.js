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

  var startAngle = Math.PI / 2;
  var endAngle = startAngle - angle * Math.PI / 180;

  context.clearRect(0, 0, 800, 600);
  context.strokeStyle = '#000000';
  context.lineWidth = 2;
  context.beginPath();
  
  context.arc(200, 200, 200, startAngle, endAngle, true);

  context.stroke();
  context.closePath();
}
