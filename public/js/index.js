var mesh = require('rtc-mesh');
var fabric = require('fabric').fabric;
var crel = require('crel');
var canvas = new fabric.Canvas('c');
var uuid = require('uuid');
var opts = {
  config: {
    iceServers: []
  }
};

// join the mesh
mesh.join('rtc-mesh-drawtest', opts, function(err, m) {

  function addObject(obj, label) {
    // add the object to the canvas
    canvas.add(obj);

    // tag the object
    obj._label = label || uuid.v4();

    // add the object into mesh data
    m.data.set(obj._label, obj.toJSON());
  }

  function updateState(evt) {
    if (evt.target && evt.target._label) {
      m.data.set(evt.target._label, evt.target.toJSON());
    }
  }

  function remoteUpdate(data, clock, srcId) {
    var key;
    var target;

    if (srcId === m.id) {
      return;
    }

    key = data[0];
    target = canvas._objects.filter(function(obj) {
      return obj._label === key;
    })[0];

    // if we don't have the target, then add the target
    if (! target) {
      // use fabric deserialization
      fabric.util.enlivenObjects([data[1]], function(objects) {
        objects[0]._label = key;
        canvas.add(objects[0]);
      });
    }
    else {
      target.set(data[1]);
      canvas.renderAll();
    }
  }

  canvas.on('object:modified', updateState);
  m.data.on('update', remoteUpdate);

  m.on('sync', function() {
    console.log('synced');

    if (m.data.get('startrect')) {
      return;
    }

    addObject(new fabric.Rect({
      left: 100,
      top: 100,
      fill: 'blue',
      height: 200,
      width: 200
    }), 'startrect');
  });
});