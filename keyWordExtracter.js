'use strict';
require('dotenv').config()
let https = require ('https');

let accessKey = process.env.TEXT_ANALYZER_KEY;
let uri = 'eastus.api.cognitive.microsoft.com';
let path = '/text/analytics/v2.0/keyPhrases';

let response_handler = function (response) {
	let body = '';
	response.on ('data', function (d) {
		body += d;
	});
	response.on ('end', function () {
		let body_ = JSON.parse (body);
		let body__ = JSON.stringify (body_, null, '  ');
		console.log (body__);
	});
	response.on ('error', function (e) {
		console.log ('Error: ' + e.message);
	});
};

let get_key_phrases = function (documents) {
	var lines = documents.split('\n');
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

	let req = https.request (request_params, response_handler);
	req.write (body);
	req.end ();
}

//var lang = "en";

// Sample parameter
/* let documents = {'documents': [
	{ 'id': 1, 'language': lang, 'text': "I want this forever man"}
]}; */

module.exports = {
	get_key_words: get_key_phrases
};

