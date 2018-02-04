var api = require('genius-api');
var genius = new api('29ZMJ9z_ol5_6XWO1iUwDd1D2ecU9l2IaGDLZ_Peq6bSoN7KxhBC0DrEbvDOSCI6');

var express = require('express');
var fs = require('fs');
var request = require('request');
var cheerio = require('cheerio');
var app     = express();
var url="";
var title;
var name_of_song ="Humble";
var top_song;

console.log("Enter name of the song");

//enter name of song // The front end input //Humble is used as default

genius.search(name_of_song).then(function(response) {
    //console.log('hits', response.hits);
    top_song = response.hits[0].result.url;
    //console.log(top_song);

//if multiple hits then selects the first one

    request({
        uri: top_song,
    }, function(error, response, body) {

        if(!error){
            var rom = cheerio.load(body);


            rom('.lyrics').filter(function(){
                var data = rom(this);

                title = data.children().first().text();
                title = title.replace("[Album Intro]","").replace("[Video Intro]","").replace("[Verse 1]","").replace("[Verse 2]","").replace("[Chorus]","");
                //
                //Final lyrics
                console.log(title.toString());
                //
            })
        }
    });
});



