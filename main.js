var b = require('./meta_maker.js');

b.getMetaData('ts.mp3', function (res) {
		console.log(JSON.stringify(res, null, 2));
		});
