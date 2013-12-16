var crel = require('crel');
var canvas = crel('canvas', { width: 500, height: 500 });
var fui = require('fui');
var mesh = require('rtc-mesh');
var lastPositions = {};
var context = canvas.getContext('2d');
var config = {
  iceServers: [
    { url: 'stun:stun.l.google.com:19302' }
  ]
};

// join the mesh
mesh.join('rtc-mesh-drawtest', { config: config }, function(err, m) {

  function updateState(key, vec) {
    var lastPos;

    lastPos = lastPositions[key];

    // if we have a last position, then move to that position and line to
    // the new position
    if (lastPos && vec) {
      context.beginPath();
      context.moveTo(lastPos[0], lastPos[1]);
      context.lineTo(vec[0], vec[1]);
      context.stroke();
    }

    // update the last position
    lastPositions[key] = vec;
  }

  // when we get data updates write them to the screen
  m.data.on('change', updateState);

  fui()
    .up(function() {
      this.state.down = false;
      m.data.set(m.id, null);
    })
    .filter('canvas')
    .relative()
    .down(function() {
      this.state.down = true;
    })
    .move(function(target, x, y) {
      if (! this.state.down) {
        return;
      }

      m.data.set(m.id, [x, y]);
    });
});

// when the document is ready, add the canvas
window.addEventListener('load', function() {
  document.body.appendChild(canvas);
});

