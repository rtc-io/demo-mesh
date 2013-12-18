# rtc-mesh Demo Project

This is a project that demonstrates how [rtc-mesh](https://github.com/rtc-io/rtc-mesh) can be used to very simply enable P2P communication in your application.

This project makes use of [fabric.js](http://fabricjs.com/) to allow dynamic
updates to elements that have been created on a test canvas.  As those objects are modified the state of the target object is communicated to the peer.

## Running the demo

```
git clone https://github.com/rtc-io/rtcio-demo-mesh.git
cd rtcio-demo-mesh
npm install
npm start
```

Then open a few browser windows to http://localhost:1337/ and let the fun begin.

## Current Limitations

At this stage only one object is created in the canvas by the first detected peer in the room.  A small toolbox will be added to allow creation of new shapes.