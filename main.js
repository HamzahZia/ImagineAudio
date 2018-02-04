var b = require('./meta_maker.js');

b.getMetaData('https://qhacks18.firebaseapp.com/94fd0a47-4a74-4260-a8d0-d62d62a648d8', function (res) {
		console.log(JSON.stringify(res, null, 2));
		});
