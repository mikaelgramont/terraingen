var $height = $('#height'),
    $angle = $('#angle'),
    $radius = $('#radius'),
    $length = $('#length'),
    height,
    angle,
    radius,
    length;

$height.keyup(update).blur(update);
$angle.keyup(update).blur(update);
update();

function calculateRadius(h, alphaDeg) {
  var alphaRad = alphaDeg * Math.PI / 180;
  var r = h / (1 - Math.cos(alphaRad));
  return r;
}

function calculateLength(h, alphaDeg) {
  var alphaRad = alphaDeg * Math.PI / 180;
  var l = h * Math.sin(alphaRad) / (1 - Math.cos(alphaRad));
  return l;    
}

function update() {
  height = parseFloat($height.val());
  angle = parseFloat($angle.val());

  radius = calculateRadius(height, angle);
  length = calculateLength(height, angle);

  $radius.html(radius);
  $length.html(length);
}
