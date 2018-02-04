var b = require('./meta_maker.js');

b.getMetaData('https://www.nasa.gov/mp3/591240main_JFKmoonspeech.mp3', function (res) {
		console.log(JSON.stringify(res, null, 2));
		});
