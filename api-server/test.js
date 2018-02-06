var https = require('https');
var qs = require('querystring');
let path = encodeURI('/bing/v7.0/images/search?q=hello&count=1');
let start = '/bing/v7.0/images/search?q=hello';
let queryOpts = {}
queryOpts['count'] = 2;
queryOpts['safeSearch'] = "off";
queryOpts['offset'] = 10;
var qStr = qs.stringify(queryOpts);
var reqUri = start + '&' + qStr;
console.log(reqUri);
let request_params = {
    method: 'GET',
    hostname: 'api.cognitive.microsoft.com',
    path: reqUri,
    headers: {
        'Ocp-Apim-Subscription-Key': 'd3e1721f257d4a7b90d06e0fff664ec3'
    }
};

console.log(request_params);


let req = https.request(request_params, (response) => {
    let body = '';
    response.on('data', (d) => {
      body += d;
    });
    response.on('end', () => {
      body = JSON.parse(body);
      console.log(body);
    });
    response.on('error', (e) => {
      console.log('Error in bingImageSearch: ' + e.message);
    })
  });

req.end();