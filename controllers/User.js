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
			var template = nunjucks.render('./app/templates/chordTest.html', {results: results});
			console.log('SECOND LEVEL', data.length)
			results.secondLevel = data;
			var tree = userController.buildTree(results);

			reply(template);
		}
		
		async.parallel([
			function (cb) {
				var time1 = new Date().getTime();
				userController.getData(username, function (userData) {
					results.userData = userData;

					var time2 = new Date().getTime()
					console.log('time', time2 - time1)

				    cb();
				});
			},
			function (cb) {
				var time3 = new Date().getTime();

				userController.getFollowing(username, function (following) {
				    var time4 = new Date().getTime()

				    // following = _.map(function (item) {
				    // 	//delete item._id
				    // 	console.log(item)
				    // 	return item;
				    // })
					console.log('time2', time4 - time3)
					results.following = following;
					var followedSecondLevel = _.pluck(following, 'follows');

					userController.getFollowing(followedSecondLevel, followingCallback)
				    
					cb();
				});
			}
		], function (cb) {
			console.log('I have you NOW ')
		});
	},

	buildTree: function (results) {
		// var aggregate = {};

		// _.map(results.following, function (followedFirstLevel) {
		// 	var byUser = _.where(results.secondLevel, {login: followedFirstLevel.follows})

		// 	aggregate[followedFirstLevel.follows] = _.map(byUser, function (secondLevel) {
		// 		return secondLevel.follows
		// 	})
		// });

		var aggregate = [];

		_.map(results.following, function (followedFirstLevel) {
			var byUser = _.where(results.secondLevel, {login: followedFirstLevel.follows})

			var imports = _.map(byUser, function (secondLevel) {
				return 'flare.analytics.cluster.' + secondLevel.follows
			});

			aggregate.push({
				name: 'flare.analytics.cluster.' + followedFirstLevel.follows,
				size: 1000,
				imports: imports
			})
		});

		console.log(aggregate[0])
		var fs = require('fs');
		fs.writeFile(__dirname + "/test.json", JSON.stringify(aggregate), function(err) {
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