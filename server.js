/* jshint node: true */
'use strict';

var express = require('express');
var browserify = require('browserify-middleware');
var path = require('path');
var app = express();

app.set('port', process.env.NODE_PORT || 3000);
app.use(app.router);

app.use('/js', browserify(path.join(__dirname, 'public/js'), {
  external: ['canvas'],
  minify: false,
  debug: true
}));

app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

// serve front-end files
var server = require('http').Server(app);
var switchboard = require('rtc-switchboard')(server);

app.get('/rtc.io/primus.js', switchboard.library());

// start the server
server.listen(app.get('port'), function(err) {
  if (err) {
    return console.log('Encountered error starting server: ', err);
  }

  console.log('server running at http://localhost:' + app.get('port') + '/');
});
