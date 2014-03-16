/* jshint node: true */
'use strict'

var mesh = require('rtc-mesh');
var quickconnect = require('rtc-quickconnect');
var crel = require('crel');
var uuid = require('uuid');

// set this to true to update as moving, scaling, rotating events occur
var canvas;
var dynamicUpdates = false;

// initialise the connection
var qc = quickconnect('http://rtc.io/switchboard', {
  // debug: true,
  room: 'rtcio-demo-mesh',
  iceServers: require('freeice')()
});

// create the shared model
var model = mesh(qc);

function addObject(obj, label) {
  // add the object to the canvas
  canvas.add(obj);

  // tag the object
  obj._label = label || uuid.v4();

  // add the object into mesh data
  model.set(obj._label, obj.toJSON());
}

function checkInit() {
  console.log('checking if initialization required');

  if (model.get('startrect')) {
    return;
  }

  addObject(new fabric.Text('hello', {
    left: 210,
    top: 100
  }), 'testlabel');

  addObject(new fabric.Rect({
    left: 200,
    top: 200,
    fill: 'red',
    height: 100,
    width: 50
  }), 'anotherrect');

  addObject(new fabric.Rect({
    left: 100,
    top: 100,
    fill: 'blue',
    height: 100,
    width: 100
  }), 'startrect');
}

function updateState(evt) {
  // TODO: debounce
  if (evt.target && evt.target._label) {
    model.set(evt.target._label, evt.target.toJSON());
  }
}

function remoteUpdate(data, clock, srcId) {
  var key;
  var target;

  console.log('captured remote update', arguments);

  if (srcId === model.id) {
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

model.on('update', remoteUpdate);
model.on('sync', checkInit);

qc.on('roominfo', function(data) {
  console.log('room info: ', data);
  // if when we join we are the only member, initilaise the canvas
  if (data && data.memberCount === 1) {
    checkInit();
  }
});

document.body.appendChild(crel('canvas', {
  id: 'c',
  width: window.innerWidth,
  height: window.innerHeight
}));

canvas = new fabric.Canvas('c');
canvas.on('object:modified', updateState);

// if dynamic updates are enabled then communicate changes
// as they are happening in the UI
if (dynamicUpdates) {
  canvas.on({
    'object:moving': updateState,
    'object:scaling': updateState,
    'object:rotating': updateState
  });
}