var mongoose = require('mongoose');
var async = require('async');
var nunjucks = require('nunjucks');
var _ = require('lodash');

var usersCollection = require('../collections/User');
var User = require('../models/User');
var Follower = new require('../models/Follower')();

var userController = {
	getData: function (username, callback) {
		//var url = 'https://api.github.com/users/' + username;
		
		User.get({login: username}, callback);
	},

	getFollowers: function (username, cb) {
		//maybe just to the user?

		//usersCollection.getModels({follows: username}, cb);
	},

	getFollowing: function (query, cb) {
		//var url = 'https://api.github.com/users/' + username + '/following';
		if (_.isArray(query)) {
			Follower.schema.methods.GOT(query, cb);
		}

		if (_.isString(query)) {
			Follower.schema.methods.GOT({login: query}, cb);
		}
	},

	userPageHandler: function (request, reply) {
		var that = this;
		var username = request.params.name;
		var results = {};


		var followingCallback = function (data) {
			//var template = nunjucks.render('./app/templates/following.html', {users: results.following});
			// results.following = _.map(results.following, function (item) {
			// 	return {
			// 		login: item.login
			// 	}
			// })

			var template = nunjucks.render('./app/templates/chordTestUsers.html', {results: results});
			console.log('SECOND LEVEL', data.length)
			results.secondLevel = data;
			var tree = userController.buildTree(results);

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

	buildTree: function (results) {
		var aggregate = [];
		var toInsert = [];

		//maps all the first level users
		_.map(results.following, function (followedFirstLevel) {
			// return an array with objects representing the followed users on the 
			//secondLevel aggregated by the users on the first level
			//It's necessary because the results.secondLevel is an array with objects
			//but is not filtered
			var byUser = _.where(results.secondLevel, {login: followedFirstLevel.follows})

			//get just the property 'follows' on 'byUser' array
			var loginsByUser = _.pluck(byUser, 'follows');

			aggregate.push({
				name: followedFirstLevel.follows,
				size: 1000,
				imports: loginsByUser
			});
		});

		//insert missing nodes from second level to avoid bug on graph
		_.map(aggregate, function (user) {
			_.map(user.imports, function (imported) {
				var present = _.where(aggregate, {name: imported});
				if (present.length === 0) {
					toInsert.push(imported)
				}
			});
		});

		_.map(toInsert, function (missedOnMap) {
			//console.log(missedOnMap)
			aggregate.push({
				name: missedOnMap,
				size: 1000,
				imports: []
			})
		})

		var fs = require('fs');
		fs.writeFile("/home/rafael/code/githubInsights/app/flare-test.json", JSON.stringify(aggregate), function(err) {
		    if(err) {
		        console.log(err);
		    } else {
		        console.log("The file was saved!");
		    }
		}); 
		return aggregate;
	}
}

module.exports = userController;