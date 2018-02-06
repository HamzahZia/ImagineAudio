console.log("Server Started")
var http = require('http');
var https = require('https');
var watson = require('watson-developer-cloud');
var fs = require('fs');
var recognizeFile = require('watson-speech/speech-to-text/recognize-file');
var privateVars = require('../private_vars.js');

const MS_COGNITIVE_TEXT_ANALYTICS_URI = 'eastus.api.cognitive.microsoft.com';
const MS_COGNITIVE_IMAGE_SEARCH_URI = 'api.cognitive.microsoft.com';
const MS_COGNITIVE_TEXT_ANALYTICS_ACCESS_KEY = "4f3eb6b2a6c1407fb94187a5fc1cdfa5";
const MS_COGNITIVE_IMAGE_SEARCH_ACCESS_KEY = "d3e1721f257d4a7b90d06e0fff664ec3";
const MS_COGNITIVE_TEXT_ANALYTICS_PATH = '/text/analytics/v2.0/keyPhrases';
const MS_COGNITIVE_IMAGE_SEARCH_PATH = '/bing/v7.0/images/search';
const WatsonAuthorization = new watson.AuthorizationV1 ({
	username: privateVars.watsonUsername,
	password: privateVars.watsonPassword,
	url: "https://stream.watsonplatform.net/speech-to-text/api"
});

/**
 * Returns the key phrases for the given text. Uses the MS Text Analytics API
 * 
 * @param {any} documents Phrase to parse
 * @param {any} callback Callback Function
 */
function getKeyWords(documents, callback) {
  // Generate body for the request
  let lines = documents.split('.'); // Splits into sentences. Helps get more key phrases
  let content = {'documents': [] };
  let count = 1;
  lines.forEach((line) => {
    content.documents.push({'id': count, 'language': 'en', 'text': line});
    count++;
  });
  let body = JSON.stringify(content);
  // Send to MS Text Analytics API
  let request_params = {
    method: 'POST',
    hostname: MS_COGNITIVE_TEXT_ANALYTICS_URI,
    path: MS_COGNITIVE_TEXT_ANALYTICS_PATH,
    headers: {
      'Ocp-Apim-Subscription-Key': MS_COGNITIVE_TEXT_ANALYTICS_ACCESS_KEY
    }
  };
  
  let req = https.request(request_params, (response) => {
    let response_body = '';
    response.on('data', (d) => {
      response_body += d;
    });
    response.on('end', () => {
      let body_ = JSON.parse(response_body);
      // console.log(JSON.stringify(body_));
      callback(null, body_);
    });
    response.on('error', (e) => {
      callback(e, null);
      console.log('Error in getKeyWords: ' + e.message);
    });
  });

  req.write(body);
  req.end();
}

/**
 * Takes a search term and returns an image. Uses the MS Bing Search API
 * 
 * @param {any} search Searches for an image based on the given term
 * @param {any} callback Callback Function

 * 
 */
function bingImageSearch(search, callback) {
  let request_params = {
    method: 'GET',
    hostname: MS_COGNITIVE_IMAGE_SEARCH_URI,
    path: MS_COGNITIVE_IMAGE_SEARCH_PATH + '?q=' + encodeURIComponent(search) + "&count=" + 1,
    headers: {
      'Ocp-Apim-Subscription-Key': MS_COGNITIVE_IMAGE_SEARCH_ACCESS_KEY
    }
  };
  let req = https.request(request_params, (response) => {
    let body = '';
    response.on('data', (d) => {
      body += d;
    });
    response.on('end', () => {
      body = JSON.parse(body);
      callback(body);
    });
    response.on('error', (e) => {
      console.log('Error in bingImageSearch: ' + e.message);
    })
  });

  req.end();
}

/**
 * Given phrases, finds images for them.
 * 
 * @param {any} lyrics 
 * @param {any} callback 
 */
function getImages(lyrics, callback) {
  let count = 0;
  lyrics.documents.forEach(line => {
    line['urls'] = {};
    line.keyPhrases.forEach(word => {
      bingImageSearch(word, (result) => {
        let url = result.value[0].thumbnailUrl;
        line.urls[word] = url;
      });
    });
    count++;
  });

  setTimeout(() => {
    callback(lyrics)
  }, count*1000);
}

/**
 * 
 * Takes in the url for an mp3 file, and returns the words
 * 
 * @param {any} url Url to an mp3 file
 * @param {any} callback Callback Function
 */
function getMetaData(url, callback) {
  let initialObj = {"results": []};
  WatsonAuthorization.getToken((err, token) => {
    if (!token) {
      console.log('error: ', err);
    } else {
      let stream = new recognizeFile({
        token: token,
        file: url,
        'content-type': 'audio/mp3',
        timestamps: true,
        realtime: false,
        objectMode: true,
        extract_results: true
      });

      stream.on('data', (data) => {
        if (data.results.length > 0 && data.results[0].alternatives[0].transcript.indexOf(".") !== -1) {
          initialObj.results.push(data.results[0]);
        }
      });
      stream.on('error', (err) => {
        console.log('Error in getMetaData: ', err);  
      });
      stream.on('end', () => {
        formatRes(initialObj, callback);
      });
    }
  });
}

/**
 * Does some magic formatting stuff.
 * 
 * @param {any} s 
 * @param {any} array 
 * @param {any} callback 
 */
function find(s, array, callback) {
	let word = s.split(' ');
	let c = 0;
	let done = false;
	array.forEach((w) => {
		if (w[0].trim() === word[c] && !done) {
			c++;
			if (c === word.length) {		
				callback(w[1]);
				done = true;
			}
		} else { c = 0; }
	});
}

/**
 * 
 * Formats the results from getMetaData
 * 
 * @param {any} initialObj 
 * @param {any} callback 
 */
function formatRes(initialObj, callback) {
  let lyrics = "";
  initialObj.results.forEach((sentence) => {
    lyrics += (sentence.alternatives[0].transcript.replace(/\./g,'') + '.');
  });

  getKeyWords(lyrics, (err, result) => {
    if (err) {
      console.log("Error in formatRes: " + err);
    } else {
      let c = 0;
      result.documents.forEach((k) => {
        k['timestamps'] = {};
        k.keyPhrases.forEach((j) => {
          find(j, initialObj.results[c].alternatives[0].timestamps, (r) => {
            k.timestamps[j] = r;
          });
        });
        c++;
      });
      
      getImages(result, (fullResults) => {
        let finalJSON = {};
        fullResults.documents.forEach((id) => {
          id.keyPhrases.forEach((word) => {
            finalJSON[id.timestamps[word]] = [word, id.urls[word]];
          });
        });
        callback(finalJSON);
      });
    }
  });
}

// Starts the server
http.createServer(function (req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*"); // Prevent CORS issues
  res.writeHead(200, {'Content-Type': 'text/json'}); // Set the type of the data being sent

  var audioUrl = req.url.substr(1, req.url.length);
  getMetaData(audioUrl, (result => {
    res.write(JSON.stringify(result));
    res.end();
  }));
}).listen(8090);