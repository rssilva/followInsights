var mongoose = require('mongoose');
var async = require('async');
var nunjucks = require('nunjucks');
var _ = require('lodash');
var fs = require('fs');

var User = require('../models/User');
var Follower = new require('../models/Follower')();
var ChordGraph = require('../models/ChordGraph');

var userController = {
	getData: function (username, callback) {
		User.get({login: username}, callback);
	},

	getFollowing: function (query, cb) {
		if (_.isArray(query)) {
			Follower.schema.methods.GOT(query, cb);
		}

		if (_.isString(query)) {
			Follower.schema.methods.GOT({login: query}, cb);
		}
	},

	userPageHandler: function (request, reply) {
		var username = request.params.name;
		var results = {};
		console.log('the input user is ', username)
		var followingCallback = function (data) {
			var template = nunjucks.render('./app/templates/chordTestUsers.html', {results: results});
			var tree;

			results.secondLevel = data;
			tree = userController.parseChordData(username, results);
			console.log('secondLevel', data.length)
			reply(template);
		}
		
		async.parallel([
			// function (cb) {
			// 	var time1 = new Date().getTime();
			// 	userController.getData(username, function (userData) {
			// 		results.userData = userData;

			// 		var time2 = new Date().getTime()
			// 		console.log('time', time2 - time1)

			// 	    cb();
			// 	});
			// },
			function (cb) {
				var time3 = new Date().getTime();

				//get all users followed by the username
				userController.getFollowing(username, function (following) {
				    var time4 = new Date().getTime()
				    console.log('first level', following.length)
					console.log('time2', time4 - time3)

					results.following = following;

					//get only the 'follows' property from 'following' array
					var followedFirstLevel = _.pluck(following, 'follows');

					// get all the users followed by each username in the 'followedFirstLevel' array
					//this method will get the 'followedSecondLevel' from database
					userController.getFollowing(followedFirstLevel, followingCallback)
				    
					cb();
				});
			}
		], function (cb) {
			console.log('I have you NOW ')
		});
	},

	parseChordData: function (username, results) {
		var chordData = [];

		chordData = ChordGraph.parseData(username, results.following, results.secondLevel);
		
		fs.writeFile("/home/rafael/code/githubInsights/app/flare-test.json", JSON.stringify(chordData), function(err) {
		    if(err) {
		        console.log(err);
		    } else {
		        console.log("The file was saved!");
		    }
		});

		return chordData;
	}
}

module.exports = userController;