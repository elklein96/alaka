var express = require('express');
var request = require('request');
var http = require('http');
var querystring = require('querystring');
var fs = require('fs');
var path = require('path');
var spawn = require('child_process').spawn;
var cv = require('opencv');
var io = require('socket.io').listen(server);

var generateRandomString = function(length) {
  var text = '';
  var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  for (var i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
};

var app = express();
var server = http.createServer(app);

app.use(express.static(__dirname + '/public'));

server.listen(process.env.PORT || 8888, function(){
  console.log("Express server listening on port %d", this.address().port);
});

app.get('/', function(req, res) {
  // camera properties
  var camWidth = 320;
  var camHeight = 240;
  var camFps = 10;
  var camInterval = 1000 / camFps;

  // face detection properties
  var rectColor = [0, 255, 0];
  var rectThickness = 2;

  // initialize camera
  var camera = new cv.VideoCapture(0);
  camera.setWidth(camWidth);
  camera.setHeight(camHeight);

  io.sockets.on('connection', function (socket) {
    setInterval(function() {
      camera.read(function(err, im) {
        if (err) throw err;

        im.detectObject('./node_modules/opencv/data/haarcascade_frontalface_alt2.xml', {}, function(err, faces) {
          if (err) throw err;

          for (var i = 0; i < faces.length; i++) {
            face = faces[i];
            im.rectangle([face.x, face.y], [face.width, face.height], rectColor, rectThickness);
          }

          socket.emit('frame', { buffer: im.toBuffer() });
        });
      });
    }, camInterval);
  });

  /*
  var playlist_id = req.query.playlist_url.match('playlist\/(.*)\/')[1];

  var playlistOptions = {
    url: 'https://api.spotify.com/v1/users/'+req.query.user_id+'/playlists/'+playlist_id+'/tracks',
    headers: { 'Authorization': 'Bearer ' + req.query.access_token },
    json: true
  };

  request.get(playlistOptions, function(error, response, body) {
    if (!error && response.statusCode === 200) {
      var playlist_info = body;
      res.send({
        'playlist_info': playlist_info
      });
    }
  });*/
});