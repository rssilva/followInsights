var request = require('request');
var model = require('../models/Model');

var Collection = {
	getModels: function (queryObj, cb) {
		var stream = this.model.model.find(queryObj).stream();
		var data = [];

		stream.on('data', function (modelData) {
			if (modelData) {
				//this.pause()
				//console.log('HABEMUS DATA')
				data = modelData;
			}

		  	//res.write(doc)
		});

		stream.on('error', function (err) {
		  	// handle err
		  	console.log(err)
		})

		stream.on('close', function () {
		  	// all done
		  	//console.log('stream CLOSED \n\n\n');
		  	cb(data);
		})

		// request(opts, function (error, response, body) {
		// 	cb(JSON.parse(body))
		// });
	}
}

module.exports = Collection;