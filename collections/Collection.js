var request = require('request');

var Collection = {
	getModels: function (url, cb) {
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

module.exports = Collection;