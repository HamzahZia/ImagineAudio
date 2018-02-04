require('dotenv').config();
var keyword = require('./keyWordExtracter.js');
var image_finder = require('./ImageSearch.js');
var SpeechToTextV1 = require('watson-developer-cloud/speech-to-text/v1');
var fs = require('fs');
var speech_to_text = new SpeechToTextV1 ({
    username: process.env.IBM_S2T_USERNAME,
    password: process.env.IBM_S2T_PASSWORD
});

var params = {
    audio: fs.createReadStream('./ts.mp3'),
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
		    console.log(JSON.stringify(fullresults, null, 2));
		});
	    }
	});
    }
});

