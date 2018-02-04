var b = require('./meta_maker.js');

b.getMetaData('https://listenaminute.com/o/ozone_layer.mp3', function (res) {
		console.log(JSON.stringify(res, null, 2));
		});
