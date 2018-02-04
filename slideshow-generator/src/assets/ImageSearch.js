'use strict';

let https = require('https');
let subscriptionKey = 'd3e1721f257d4a7b90d06e0fff664ec3';

let host = 'api.cognitive.microsoft.com';
let path = '/bing/v7.0/images/search';

let bing_image_search = function (search, callback) {
  let request_params = {
        method : 'GET',
        hostname : host,
        path : path + '?q=' + encodeURIComponent(search) + "&count=" + 1,
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

function searchlyrics(lyrics, callback) {
  var count = 0;
  lyrics.documents.forEach (line => {
    line["urls"] = [];
    line.keyPhrases.forEach (word => {
      bing_image_search(word, (result) => {
        let url = result.value[0].thumbnailUrl;
        line.urls.push(url); 
        console.log(url)
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
           "HDR resolution",
           "new XBox",
           "clean look"
        ],
        "id": "1"
     },
     {
        "keyPhrases": [
           "Carlos",
           "notificacion",
           "algun problema",
           "telefono movil"
        ],
        "id": "2"
     },
     {
        "keyPhrases": [
           "new hotel",
           "Grand Hotel",
           "review",
           "center of Seattle",
           "classiest decor",
           "stars"
        ],
        "id": "3"
     }
  ],
  "errors": [  ]
};

searchlyrics(ex, (finalLyrics) => {
  console.log(JSON.stringify(finalLyrics, null, 2));
});