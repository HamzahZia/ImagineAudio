import { Component, OnInit, ApplicationRef } from '@angular/core';
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

  constructor(private httpClient: HttpClient, private storage: AngularFireStorage, private appRef: ApplicationRef) {

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
      this.data = result;
      console.log(result);
    });
    this.counterInterval = setInterval(() => {
      this.currLoadingMessage = Math.min(this.currLoadingMessage + 1, this.loadingMessages.length);
      if (this.currLoadingMessage == this.loadingMessages.length) {
        clearInterval(this.counterInterval);
        this.loading = false; // Remove this when we have the api call
        this.startDisplay(this.data);
      }
    }, 5000);
    // Make api call
  }

  startDisplay(data) {
    let timeArr = [];
    let imgArr = [];
    for (let key in data) {
      timeArr.unshift(key);
      imgArr.unshift(data[1]);
    }
    for (let i = 0; i < imgArr.length; i++) {
      let pic = document.createElement('img');
      console.log(imgArr[i]);
      pic.src = imgArr[i];
      pic.
      pic.id = ""+i;
      document.querySelector('.images').appendChild(pic);
    }
    this.appRef.tick();
    console.log(timeArr);
    console.log(imgArr);
    let audio = document.createElement('audio');
    audio.setAttribute('controls', '');
    audio.className = "audio";
    (audio as any).src = this.mp3.url;
    document.querySelector('.clip2').appendChild(audio);
    setTimeout(audio.play());
    for (let i = 0; i < timeArr.length; i++) {
        setTimeout(() => {
          document.querySelector("#"+i).className = "invisible";
        }, 1000*<any>timeArr[i]);
    }
  }

  reset() {
    this.loading = false;
    this.setup = true;
    this.recorded = false;
    this.recording = false;
  }
}
