var request = require('request');

var Model = {
	get: function (url, cb) {
		var opts = {
			url: url,
			headers: {
				'user-agent': 'Node.js',
			}
		}
		
		request(opts, function (error, response, body) {
			cb(JSON.parse(body))
		});
	}
}

module.exports = Model;