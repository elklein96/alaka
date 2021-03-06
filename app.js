var express = require('express');
var request = require('request');
var http = require('http');
var fs = require('fs');
var path = require('path');
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

app.use(express.static(__dirname + '/public'));
app.use( bodyParser.json({limit:'10mb'}));
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
  var imageBuffer = decodeBase64Image(req.body.raw);
  var fileName = generateRandomString(8);
  var result = [];

  function decodeBase64Image(dataString) {
    var matches = dataString.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/), response = {};
    if (matches.length !== 3) return new Error('Invalid input string');
    response.type = matches[1];
    response.data = new Buffer(matches[2], 'base64');

    return response;
  }

  fs.writeFile('./public/cache/'+fileName+'.jpg', imageBuffer.data, function(err) {});

  var reverseImgConfig = {
    url: 'http://localhost:5000/search',
    headers: { 'Content-Type' : 'application/json'},
    data: {"image_url" : "http://localhost:8888/public/test/fileName.jpg"},
    json: true
  };

  request.get(reverseImgConfig, function(error, response, body) {
    if (!error && response.statusCode === 200) {
      var q = "";
      function findMostReaptedWord(str){
        var counts = {}, mr, mc;
        str.match(/\w+/g).forEach(function(w){ counts[w]=(counts[w]||0)+1 });
        for (var w in counts) {
          if (!(counts[w]<mc)) {
            mc = counts[w];
            mr = w;
          }
        }
        return mr;
      }

      for (var i in body.title) {
        q = q+body.title[i];
      }

      var movieDataConfig = {
        url: 'http://api.themoviedb.org/3/search/',
        headers: { 'Content-Type' : 'application/json'},
        form: {
          api_key : "16bb0c5e653d13fc1759ae1ca661324b",
          query   : q
        },
        json: true
      };

      request.get(movieDataConfig, function(error, response, body) {
        if (!error && response.statusCode === 200) {
          result.push(body);
        }
      });
    }
  });
  
  res.send({
    'actors': result
  });
  //curl -X POST -H "Content-Type: application/json" -d '{"image_url":"http://ec2-52-6-151-159.compute-1.amazonaws.com/test/chaplin.jpg"}' http://localhost:5000/search
});