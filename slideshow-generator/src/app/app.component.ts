import { Component, OnInit } from '@angular/core';
import { PACKAGE_ROOT_URL } from '@angular/core/src/application_tokens';
import { timeout } from 'q';
declare var MediaRecorder: any;
declare var require: any;
let https = require('https');

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'app';
  recording = false;
  mediaRecorder;
  chunks = [];
  counterInterval;
  timer = 0;
  recorded = false;
  setup = true;
  loading = false;
  subscriptionKey = 'd3e1721f257d4a7b90d06e0fff664ec3';
  host = 'api.cognitive.microsoft.com';
  path = '/bing/v7.0/images/search';

  constructor() {

  }

  ngOnInit() {
    navigator.mediaDevices.getUserMedia({
      audio: true
    }).then((stream) => {
      this.mediaRecorder = new MediaRecorder(stream);
      this.mediaRecorder.ondataavailable = (e) => {
        console.log("data available");
        this.chunks.push(e.data);
      }
      this.mediaRecorder.onstop = (e) => {
        console.log("recorder stopped");
        clearInterval(this.counterInterval);
        this.timer = 0;
        this.recorded = true;

        let blob = new Blob(this.chunks, { 'type': 'audio/wav; codecs=opus'});
        let audioURL = window.URL.createObjectURL(blob);
        this.chunks = [];
        let audio = document.querySelector(".audio");
        if (!audio) {
          audio = document.createElement('audio');
          audio.setAttribute('controls', '');
          audio.className = "audio";
        }        
        (audio as any).src = audioURL;
        document.querySelector('.clip').appendChild(audio);
        console.log(audioURL);
      }
    }).catch(function(err) {
      console.log('The following gUM error occured: ' + err);
    });
  }

  toggleRecord() {
    this.recording = !this.recording;
    if (this.recording) { // Start recording
      this.mediaRecorder.start();
      this.counterInterval = setInterval(() => this.timer+=1, 1000);
    } else {
      this.mediaRecorder.stop();
      this.recorded = true;
    }
  }

  getTime() {
    let minutes = Math.floor(this.timer / 60);
    let seconds = this.timer % 60;
    return ("0" + minutes).slice(-2) + ":" + ("0" + seconds).slice(-2);
  }
}

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

// searchlyrics(ex, (finalLyrics) => {
//   console.log(JSON.stringify(finalLyrics, null, 2));
// });