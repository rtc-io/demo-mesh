var crel = require('crel');
var canvas = crel('canvas', { width: 500, height: 500 });
var fui = require('fui');
var mesh = require('rtc-mesh');
var lastPositions = {};
var context = canvas.getContext('2d');

function updateState(key, vec) {
  var lastPos = lastPositions[key];

  // if we have a last position, then move to that position and line to
  // the new position
  if (lastPos) {
    context.beginPath();
    context.moveTo(lastPos[0], lastPos[1]);
    context.lineTo(vec[0], vec[1]);
    context.stroke();
  }

  // update the last position
  lastPositions[key] = vec;
}

// use the rtc.io test signaller
mesh.use('http://rtc.io/switchboard/');

// join the mesh
mesh.join('rtc-mesh-drawtest', function(err, peer) {
  // when we get data updates write them to the screen
  peer.data.on('change', updateState);

  fui()
    .up(function() {
      this.state.down = false;
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

      peer.data.set(peer.id, [x, y]);
    });
});

// when the document is ready, add the canvas
window.addEventListener('load', function() {
  document.body.appendChild(canvas);
});