var express = require('express');
var request = require('request');
var http = require('http');
var querystring = require('querystring');
var fs = require('fs');
var path = require('path');
var spawn = require('child_process').spawn;

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

app.get('/search', function(req, res) {
  var io = require('socket.io').listen(server);

  io.sockets.on('connection', function (socket) {
    
  });

  /*if(req.query.playlist_url.charAt(req.query.playlist_url.length -1) != '/')
    req.query.playlist_url = req.query.playlist_url+"/";

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