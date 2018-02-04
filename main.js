var keyword = require('./keyWordExtracter.js');

var lyric = "Hey what up I'm here at QHacks\n About to go do some quick maths";

keyword.get_key_words(lyric, function(err, result) {
	if (err) console.log(err);
	else {
		console.log(result);
	}
});
