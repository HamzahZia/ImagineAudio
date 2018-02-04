import { Component, OnInit } from '@angular/core';
import { PACKAGE_ROOT_URL } from '@angular/core/src/application_tokens';
import { timeout } from 'q';
import { environment } from '../environments/environment';
import { AuthorizationV1 } from './authorization-v1'
import { HttpClient } from '@angular/common/http';
import { AngularFireStorage } from 'angularfire2/storage';

declare var MediaRecorder: any;
declare var require: any;
// declare var Microm: any;
let https = require('https');
let _microm = require('microm');
let microm = new _microm();
let fs = require('fs');
let recognizeFile = require('watson-speech/speech-to-text/recognize-file');


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  recording = false; // True if we are currently recording
  recorded = false; // True if an audio file has been successfully recorded
  setup = true; // True if we can still change the audio file
  loading = false; // Loading the images
  loadingMessages = [
    'Analyzing Audio...', 
    'Finding Key Phrases...',
    'Querying for the Perfect Photos...',
    'Almost Ready...'
  ];
  currLoadingMessage = 0;
  data;

  mediaRecorder;
  chunks = [];
  counterInterval;
  timer = 0;
  mp3 = null;
  filename: string;
  downloadUrl;

  testData = {
    '3.39': ['seconds', 'https://tse4.mm.bing.net/th?id=OIP.eh2ion-vSVMYPsseEIjRtgHaHa&pid=Api'],
    '0.65': ['video', 'https://tse4.mm.bing.net/th?id=OIP.4COvfK34YVCraJKZwdlDuQHaHA&pid=Api'],
    '18': ['time', 'https://tse3-2.mm.bing.net/th?id=OIP.2uU_9gVSjW4RcV6RmL-T4wHaEq&pid=Api']
  }

  constructor(private httpClient: HttpClient, private storage: AngularFireStorage) {

  }
  
  makeid() {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  
    for (var i = 0; i < 5; i++)
      text += possible.charAt(Math.floor(Math.random() * possible.length));
  
    return text;
  }

  ngOnInit() {
    // navigator.mediaDevices.getUserMedia({
    //   audio: true
    // }).then((stream) => {
    //   this.mediaRecorder = new MediaRecorder(stream);
    //   this.mediaRecorder.ondataavailable = (e) => {
    //     console.log("data available");
    //     this.chunks.push(e.data);
    //   }
    //   this.mediaRecorder.onstop = (e) => {
    //     console.log("recorder stopped");
    //     clearInterval(this.counterInterval);
    //     this.timer = 0;
    //     this.recorded = true;

    //     let blob = new Blob(this.chunks, { 'type': 'audio/wav; codecs=opus'});
    //     let audioURL = window.URL.createObjectURL(blob);
    //     this.chunks = [];
    //     let audio = document.querySelector(".audio");
    //     if (!audio) {
    //       audio = document.createElement('audio');
    //       audio.setAttribute('controls', '');
    //       audio.className = "audio";
    //     }        
    //     (audio as any).src = audioURL;
    //     document.querySelector('.clip').appendChild(audio);
    //     console.log(audioURL);
    //   }
    // }).catch(function(err) {
    //   console.log('The following gUM error occured: ' + err);
    // });
  }

  toggleRecord() {
    this.recording = !this.recording;
    if (this.recording) { // Start recording
      microm.record().then(function() {
        console.log('recording...')
      }).catch(function() {
        console.log('error recording');
      });
      // this.mediaRecorder.start();
      this.counterInterval = setInterval(() => this.timer+=1, 1000);
    } else {
      // this.mediaRecorder.stop();
      this.recorded = true;
      microm.stop().then((result) => {
        this.mp3 = result;
        console.log(this.mp3.url, this.mp3.blob, this.mp3.buffer)
        clearInterval(this.counterInterval);
        this.timer = 0;
        this.recorded = true;
        let audio = document.querySelector(".audio");
        if (!audio) {
          audio = document.createElement('audio');
          audio.setAttribute('controls', '');
          audio.className = "audio";
        }        
        (audio as any).src = this.mp3.url;
        document.querySelector('.clip').appendChild(audio);
        this.filename = this.makeid();
        const task = this.storage.upload(this.filename, this.mp3.blob);
        task.downloadURL().subscribe(result => {
          this.downloadUrl = result;
          console.log(result);
        })
      })
    }
  }

  getTime() {
    let minutes = Math.floor(this.timer / 60);
    let seconds = this.timer % 60;
    return ("0" + minutes).slice(-2) + ":" + ("0" + seconds).slice(-2);
  }

  getImages() {
    this.loading = true;
    this.setup = false;
    this.currLoadingMessage = 0;
    console.log(this.mp3.url);
    this.httpClient.get('http://localhost:8090/' + this.downloadUrl).subscribe((result) => {
      console.log(result);
    });
    this.counterInterval = setInterval(() => {
      this.currLoadingMessage = Math.min(this.currLoadingMessage + 1, this.loadingMessages.length);
      if (this.currLoadingMessage == this.loadingMessages.length) {
        clearInterval(this.counterInterval);
        this.loading = false; // Remove this when we have the api call
        this.startDisplay(this.testData);
      }
    }, 5000);
    // Make api call
  }

  startDisplay(data) {
    let timeArr = [];
    let imgArr = [];
    for (let key in data) {
      timeArr.unshift(key);
      imgArr.unshift(data);
    }
  }

  reset() {
    this.loading = false;
    this.setup = true;
    this.recorded = false;
    this.recording = false;
  }
}


var authorization = new AuthorizationV1 ({
	username: environment.IBM_S2T_USERNAME,
	password: environment.IBM_S2T_PASSWORD,
	url: "https://stream.watsonplatform.net/speech-to-text/api"
});

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
	}, null);
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

get_key_phrases(lyrics, function(err, result) {
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

		searchlyrics(result, function (fullresults) {
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

let accessKey = environment.TEXT_ANALYZER_KEY;
let uri = 'eastus.api.cognitive.microsoft.com';
let path = '/text/analytics/v2.0/keyPhrases';

let get_key_phrases = function (documents, callback) {
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
  
  let subscriptionKey = process.env.BING_SEARCH;

let host = 'api.cognitive.microsoft.com';

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