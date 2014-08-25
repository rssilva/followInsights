var model = require('./Model');
var mongoose = require('mongoose');
var _ = require('lodash');

var FollowerSchema = new mongoose.Schema({
	login: String,
	avatar_url: String,
	html_url: String,
	name: String,
	company: String,
	blog: String,
	location: String,
	follows: String
});

var Model = mongoose.model('Follower', FollowerSchema, 'followers');

FollowerSchema.methods.getData = function (queryObj, cb) {
	var stream;
	var data = [];

	stream = Model.find(queryObj).stream();

	stream.on('data', function (modelData) {
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

FollowerSchema.methods.getArray = function (queryObj, cb) {
	var data = [];
	var stream = Model.find({
		login: { $in: queryObj}
	}).stream();

	// model.find({
	//     '_id': { $in: [
	//         '4ed3ede8844f0f351100000c',
	//         '4ed3f117a844e0471100000d', 
	//         '4ed3f18132f50c491100000e'
	//     ]}
	// }, function(err, docs){
	//      console.log(docs);
	// });

	stream.on('data', function (modelData) {
		//console.log(doc)
		if (modelData) {
			//this.pause()
			data.push(modelData);
		}
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
}


module.exports = Model;