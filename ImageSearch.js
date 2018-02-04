'use strict';

let https = require('https');
let subscriptionKey = 'd3e1721f257d4a7b90d06e0fff664ec3';

let host = 'api.cognitive.microsoft.com';
let path = '/bing/v7.0/images/search';

let totalImages = 10;

let bing_image_search = function (search, callback) {
  let request_params = {
        method : 'GET',
        hostname : host,
        path : path + '?q=' + encodeURIComponent(search) + "&count=" + totalImages,
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

function getRandomInt(max) {
  return Math.floor(Math.random() * Math.floor(max));
}

function searchLyrics(lyrics, callback) {
  var count = 0;
  lyrics.documents.forEach (line => {
    line["urls"] = {};
    line.keyPhrases.forEach (word => {
      var random = getRandomInt(totalImages);
      bing_image_search(word, (result) => {
        let url = result.value[random].thumbnailUrl;
        line.urls[word] =  url;
      });
    });
    count++;
  });

  setTimeout(() => {
    callback(lyrics)
  }, count*1000);
}

var ex = {
  "documents": [
    {
      "keyPhrases": [
        "seconds",
        "video",
        "time",
        "things"
      ],
      "id": "1",
      "timestamps": {
        "seconds": 3.39,
        "video": 0.65,
        "time": 5.99,
        "things": 9.25
      }
    },
    {
      "keyPhrases": [
        "seconds long distances",
        "time"
      ],
      "id": "2",
      "timestamps": {
        "seconds long distances": 16,
        "time": 18
      }
    },
    {
      "keyPhrases": [
        "meditation",
        "seconds"
      ],
      "id": "4",
      "timestamps": {
        "seconds": 28.86
      }
    }
  ],
  "errors": [
    {
      "id": "5",
      "message": "Missing input documents."
    }
  ]
};

searchLyrics(ex, (finalLyrics) => {
  console.log(JSON.stringify(finalLyrics, null, 2));
});