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
	authorization.getToken(function (err, token) {
		if (!token) {
			console.log('error:', err);
		} else {
			//console.log(token);
			var stream = new recognizeFile({
				token: token,
				file: 'http://www.sound-mind.org/media-files/self-talk-for-worry-mp3.mp3',  //'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
				'content-type': 'audio/mp3',
				timestamps: true,
				realtime: false,
				objectMode: true,
				extract_results: true
			});
			stream.on('data', function(data) {
				console.log(JSON.stringify(data, null, 2));
			});
			stream.on('error', function(err) {
				console.log(err);
			});
		}
	});
	/*var params = {
		audio: fs.createReadStream(url),
		content_type: 'audio/mp3',
		timestamps: true
	};

	function find(s, array, callback) {
		//console.log(s);
		var word = s.split(' ');
		var c = 0;
		var done = false;
		array.forEach(function (w) {
			// console.log("word is " + w[0]);
			if (w[0] === word[c] && !done) {
				c++;
				if (c === word.length) {		
					callback(w[1]);
					done = true;
				}
			} else { c = 0; }
		});
	}

	speech_to_text.recognize(params, function(err, res) {
		if (err)
			console.log(err);
		else {
			//console.log(JSON.stringify(res, null, 2));
			var lyrics = "";
			res.results.forEach(function (sentence) {
				lyrics += (sentence.alternatives[0].transcript + '.');
			});

			keyword.get_key_words(lyrics, function(err, result) {
				if (err)
					console.log(err);
				else {
					//console.log(result);
					var c = 0;
					result.documents.forEach(function (k) {
						k['timestamps'] = {};
						k.keyPhrases.forEach(function (j) {
							find(j, res.results[c].alternatives[0].timestamps, function (r) {
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
	}); */
}

module.exports = {
	getMetaData: getMetaData
};
