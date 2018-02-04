require('dotenv').config();
var keyword = require('./keyWordExtracter.js');
var image_finder = require('./ImageSearch.js');
var watson = require('watson-developer-cloud');
var fs = require('fs');
var https = require('https');

var authorization = new watson.AuthorizationV1 ({
	username: process.env.IBM_S2T_USERNAME,
	password: process.env.IBM_S2T_PASSWORD,
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
				if (data.results[0].alternatives[0].transcript.indexOf(".") !== -1)
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

keyword.get_key_words(lyrics, function(err, result) {
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

		image_finder.getImages(result, function (fullresults) {
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

module.exports = {
	getMetaData: getMetaData
};
