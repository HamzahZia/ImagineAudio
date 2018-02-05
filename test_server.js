var http = require('http');
var https = require('https');
console.log("Server Started")
http.createServer(function (req, res) {
    console.log(req.url);
    res.setHeader("Access-Control-Allow-Origin", "*");
    // res.header("Access-Control-Allow-Origin", "*");
    res.writeHead(200, {'Content-Type': 'text/json'});
    let accessKey = "4f3eb6b2a6c1407fb94187a5fc1cdfa5";
  let uri = 'eastus.api.cognitive.microsoft.com';
  let path = '/text/analytics/v2.0/keyPhrases';
  
  let get_key_words = function (documents, callback) {
    var lines = documents.split('.');
    var content = {'documents': [] };
    var count = 1;
    lines.forEach(function (line) {
      content.documents.push({'id': count, 'language': 'en', 'text': line});
      count++;
    });
  
    let body = JSON.stringify (content);
  
    let request_params = {
      method : 'POST',
      hostname : uri,
      path : path,
      headers : {
        'Ocp-Apim-Subscription-Key' : accessKey,
      }
    };
  
    let req = https.request (request_params, function (response) {
      let body = '';
      response.on ('data', function (d) {
        body += d;
      });
      response.on ('end', function () {
        let body_ = JSON.parse (body);
        //let body__ = JSON.stringify (body_, null, '  ');
        //console.log (body__);
        callback(null, body_);
      });
      response.on ('error', function (e) {
        callback(e, null);
        console.log ('Error: ' + e.message);
      });
    });
  
    req.write (body);
    req.end ();
    }






  let subscriptionKey = "d3e1721f257d4a7b90d06e0fff664ec3";

  let host = 'api.cognitive.microsoft.com';
  let path2 = '/bing/v7.0/images/search';
  
  let bing_image_search = function (search, callback) {
    let request_params = {
          method : 'GET',
          hostname : host,
          path : path2 + '?q=' + encodeURIComponent(search) + "&count=" + 1,
          headers : {
              'Ocp-Apim-Subscription-Key' : subscriptionKey,
          }
      };
  
    let req = https.request(request_params, function (response) {
      let body = '';
      response.on('data', function (d) {
          body += d;
      });
      response.on('end', function () {
          body = JSON.parse(body);
          callback(body);
      });
      response.on('error', function (e) {
          console.log('Error: ' + e.message);
      });
    });
  
    req.end();
  }
  
  function getImages(lyrics, callback) {
    var count = 0;
    lyrics.documents.forEach (line => {
      line["urls"] = {};
      line.keyPhrases.forEach (word => {
        bing_image_search(word, (result) => {
          let url = result.value[0].thumbnailUrl;
          line.urls[word] =  url;
        });
      });
      count++;
    });
  
    setTimeout(() => {
      callback(lyrics)
    }, count*1000);
  }


  





  // require('dotenv').config();
var watson = require('watson-developer-cloud');
var fs = require('fs');
var https = require('https');

var authorization = new watson.AuthorizationV1 ({
	username: "6a859c4c-948f-4a97-a2ae-de8c64f61d99",
	password: "IquS3NSBCZ02",
	url: "https://stream.watsonplatform.net/speech-to-text/api"
});

var recognizeFile = require('watson-speech/speech-to-text/recognize-file');
function getMetaData (url, callback) {
	var initialObj = {"results": []};
	authorization.getToken(function (err, token) {
		if (!token) {
			console.log('error:', err);
		} else {
			//console.log(token);
			var stream = new recognizeFile({
				token: token,
				file: url, //'http://www.sound-mind.org/media-files/self-talk-for-worry-mp3.mp3', 
				'content-type': 'audio/mp3',
				timestamps: true,
				realtime: false,
				objectMode: true,
				extract_results: true
			});
			stream.on('data', function(data) {
        //console.log(JSON.stringify(data, null, 2));
				if (data.results.length > 0 && data.results[0].alternatives[0].transcript.indexOf(".") !== -1)
					initialObj.results.push(data.results[0]);
			});
			stream.on('error', function(err) {
				console.log(err);
			});
			stream.on('end', function() {
				//console.log("DONE");
				formatRes(initialObj, callback);
			});
		}
	});
}
/*var params = {
  audio: fs.createReadStream(url),
  content_type: 'audio/mp3',
  timestamps: true
  };i*/

function find(s, array, callback) {
	//console.log(s);
	var word = s.split(' ');
	var c = 0;
	var done = false;
	array.forEach(function (w) {
	//console.log("word is " + w[0].trim());
		if (w[0].trim() === word[c] && !done) {
			c++;
			if (c === word.length) {		
				callback(w[1]);
				done = true;
			}
		} else { c = 0; }
	});
}

function formatRes(initialObj, callback) {
//console.log(JSON.stringify(initialObj, null, 2));
var lyrics = "";
initialObj.results.forEach(function (sentence) {
	lyrics += (sentence.alternatives[0].transcript.replace(/\./g,'') + '.');
}); console.log(lyrics);

get_key_words(lyrics, function(err, result) {
	if (err)
		console.log(err);
	else {
		//console.log(JSON.stringify(result, null, 2));
		var c = 0;
		result.documents.forEach(function (k) {
			k['timestamps'] = {};
			k.keyPhrases.forEach(function (j) {
				find(j, initialObj.results[c].alternatives[0].timestamps, function (r) {
					k.timestamps[j] = r;
					//console.log(j + " ---- " + k.timestamps[j]);
				});
			}); c++;
		});	
		//console.log(JSON.stringify(result, null, 2));

		getImages(result, function (fullresults) {
			// console.log(JSON.stringify(fullresults, null, 2));
			var finalJSON = {};
			fullresults.documents.forEach(function (id) {
				id.keyPhrases.forEach(function (word) {
					finalJSON[id.timestamps[word]] = [word, id.urls[word]];
				});
			});// console.log(JSON.stringify(finalJSON, null, 2));
			callback(finalJSON);
		});
	}
});
}
var daaata = req.url.substr(1, req.url.length);
getMetaData(daaata, (result) => {
    console.log(result);
    res.write(JSON.stringify(result));
    res.end();
});
}).listen(8090);