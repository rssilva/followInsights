var request = require('request');

var Model = {
	//@ToDO, maybe a stream will help?
	get: function (queryObj, cb) {
		var stream = this.model.findOne(queryObj).stream();
		var data = [];
		var opts = {
			url: 'https://api.github.com/users/' + queryObj.login,
			headers: {
				'user-agent': 'request'
			}
		}
		
		stream.on('data', function (modelData) {
			//console.log(modelData)
			if (modelData) {
				//this.pause()
				data.push(modelData);
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

module.exports = Model;