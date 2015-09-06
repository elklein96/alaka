var express = require('express');
var request = require('request');
var http = require('http');
var querystring = require('querystring');
var fs = require('fs');
var path = require('path');
var toBuffer = require('typedarray-to-buffer');
var spawn = require('child_process').spawn;
var bodyParser = require('body-parser');

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

var child  = spawn("python", ["./mrisa/mrisa_server.py"]);

child.stdout.on('data', function(data) {
  console.log("TEST "+data.toString());
});

app.use(express.static(__dirname + '/public'));
app.use( bodyParser.json({limit:'1mb'}));
app.use(bodyParser.urlencoded({
  extended: true
}));

server.listen(process.env.PORT || 8888, function(){
  console.log("Express server listening on port %d", this.address().port);
});

process.on("uncaughtException", function(err){
  console.log(err);
});

app.post('/parse', function(req, res) {

  //console.log(req.body);
  var face = req.body.face;
  var result = [];
  
  fs.write('./public/cache/image'+generateRandomString(8), new Buffer(new Uint32Array(face)), function(err){
    console.log(err);
  });
  
  /*var reverseImgConfig = {
    url: 'http://localhost:5000/search',
    headers: { 'Content-Type' : 'application/json'},
    data: {"image_url" : "http://localhost:8888/public/test/chaplin.jpg"},
    json: true
  };

  request.get(reverseImgConfig, function(error, response, body) {
    if (!error && response.statusCode === 200) {
        result.push(body);
    }
  });*/
  
  res.send({
    'actors': result
  });
  //curl -X POST -H "Content-Type: application/json" -d '{"image_url":"http://ec2-52-6-151-159.compute-1.amazonaws.com/test/chaplin.jpg"}' http://localhost:5000/search
});