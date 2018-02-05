var express = require('express');
var request = require('request');
var cheerio = require('cheerio');
var xmlToJSON = require('xmlToJSON');
var app     = express();
var title;


var url="https://www.youtube.com/watch?v=JZjAg6fK-BQ";
console.log("Enter the youtube link");

url = url.replace("https://www.youtube.com/watch?v=","http://video.google.com/timedtext?lang=en&v=");

console.log(url);



request({
    uri: url,
}, function(error, response, body) {

    if(!error){
        // var rom = cheerio.load(body);
        // console.log(body);

        var parseString = require('xml2js').parseString;
        var xml = body;
        parseString(xml, function (err, result) {
             // console.dir(result);
            var fs = require('fs');
            fs.writeFile('output.json', JSON.stringify(result, null, 4), function(err){

                // console.log('File successfully written! - Check your project directory for the output.json file');
                console.log("\n");
                var lyric="";
                var i=1;
                while(result.transcript.text[i].$){

                    if(result.transcript.text[i]._){
                        //console.log(result.transcript.text[i]._);
                        lyric = lyric + result.transcript.text[i]._;
                         // console.log(result.transcript.text[i]._);
                    }
                    console.log(Number(result.transcript.text[i].$.start) + " - " + (Number(result.transcript.text[i].$.start) + Number(result.transcript.text[i].$.dur)));

                    i++;

                    if(result.transcript.text[i].$ ){continue;}
                }
                console.log(lyric);


            });
        });

        // var testString = '<xml><a>It Works!</a></xml>';  	// get some xml (string or document/node)
        // var result = xmlToJSON.parseString(xml);
        // console.log(result);


    }
});



//
//
// var myJson = {
//     key: "myvalue"
// };
//
// fs.writeFile( "youtube_json.json", JSON.stringify( myJson ), "utf8", yourCallback );


/*

var xml2js = require('xml2js');
var parser = new xml2js.Parser();
var check;

fs.readFile(body.toString(),function(err,data){

    parser.parseString(data,function (err,result) {
        console.log(result);
        check = result;
    });
});

*/

// console.log(check);
