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

var child  = spawn("python", ["/mrisa/mrisa_server.py"]);

child.stdout.on('data', function(data) {
  console.log("TEST "+data.toString());
});

app.use(express.static(__dirname + '/public'));

server.listen(process.env.PORT || 8888, function(){
  console.log("Express server listening on port %d", this.address().port);
});

app.get('/parse', function(req, res) {
  var faces = req.query.faces;
  var result = [];

  for(var i=0; i<faces.length; i++){
    var playlistOptions = {
      url: 'http://localhost:5000/search',
      headers: { 'Content-Type' : 'application/json'},
      data: {"image_url" : "./public/test/chaplin.jpg"},
      json: true
    };

  request.get(playlistOptions, function(error, response, body) {
    if (!error && response.statusCode === 200) {
        result.push(body);
    }
  });
  }
  
  res.send({
    'playlist_info': playlist_info
  });


  //curl -X POST -H "Content-Type: application/json" -d '{"image_url":"http://upload.wikimedia.org/wikipedia/commons/2/29/Voyager_spacecraft.jpg"}'
  /*if(req.query.playlist_url.charAt(req.query.playlist_url.length -1) != '/')
    req.query.playlist_url = req.query.playlist_url+"/";

  var playlist_id = req.query.playlist_url.match('playlist\/(.*)\/')[1];

  var playlistOptions = {
    url: 'https://api.spotify.com/v1/users/'+req.query.user_id+'/playlists/'+playlist_id+'/tracks',
    headers: { 'Content-Type': 'application/json ' + req.query.access_token },
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