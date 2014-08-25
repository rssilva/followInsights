'use strict'

var async = require('async');
var nunjucks = require('nunjucks');
var _ = require('lodash');
var fs = require('fs');

var User = new require('../models/User')();
var Follower = new require('../models/Follower')();
var ChordGraph = require('../models/ChordGraph');

User.m = User.schema.methods;

var userController = {
	getParsedData: function (username, callback) {
		var results = {};
		results.levels = [{}, {}];
		console.log('username -- ', username)

		var time1 = new Date().getTime();

		try{
			var fromFile = fs.readFileSync(__dirname + '/' + username + '.json', {enconding: 'utf-8'}); 
			var results = JSON.parse(fromFile.toString());

			callback(results);
			
		} catch (e) {
			async.waterfall([
				function (cb) {
					User.schema.methods.getData({login: username}, function (userData) {
						results.userData = userData;
						cb();
					})
				},
				function (cb) {
					//get all users followed by the username consulting
					//on the 'followers' collection
					Follower.schema.methods.getData({login: username}, function (firstLevel) {
						//get only the 'follows' property from 'following' array
						var logins = _.pluck(firstLevel, 'follows');

						results.levels[0].fromFollowers = firstLevel;

						cb(null, logins);
					});
				},
				function (firstLevelLogins, cb) {
					//get all users followed by the user consulting on
					//the 'users' collection
					User.schema.methods.getArray(firstLevelLogins, function (firstLevelObj) {
						results.levels[0].fromUsers = firstLevelObj;

						cb(null, firstLevelLogins);
					});
				},
				function (firstLevelLogins, cb) {
					// get all the users followed by each username in the 'firstLevelLogins' array
					//this method will get the 'followedSecondLevel' from database
					Follower.schema.methods.getArray(firstLevelLogins, function (secondLevel) {
						var logins = _.pluck(secondLevel, 'follows');

						results.levels[1].fromFollowers = secondLevel;

						cb(null, logins);
					});
				},
				function (secondLevelLogins, cb) {
					User.schema.methods.getArray(secondLevelLogins, function (secondLevelObj) {
						console.log(secondLevelObj.length)
						results.levels[1].fromUsers = secondLevelObj;

						cb();
					});
				}
			], function () {
				console.log('TIME : ', new Date().getTime() - time1);
				console.log('this is the end');
				fs.writeFile(__dirname + '/' + username + '.json', JSON.stringify(results), function(err) {
					err ? console.log(err)
					:
				    console.log("The file was saved!")
				});
				callback(results)
			});
		}
	},

	filterData: function (data) {
		var filtered = {};
		filtered.mostFollowed = [];
		filtered.mostFollowing = [];
		filtered.companys = [];
		filtered.cities = [];
		filtered.commonBio = [];
		filtered.repos = [];
		filtered.gists = [];
		filtered.created = [];

		var time2 = new Date().getTime()
		filtered.userData = data.userData;

		filtered.mostFollowed[0] = User.m.filterByMostFollowers(data.levels[0].fromUsers);
		filtered.mostFollowed[1] = User.m.filterByMostFollowers(data.levels[1].fromUsers);

		filtered.mostFollowing[0] = User.m.filterByMostFollowing(data.levels[0].fromUsers);
		filtered.mostFollowing[1] = User.m.filterByMostFollowing(data.levels[1].fromUsers);

		filtered.followedByUserFollowing = User.m.getFollowedByUserFollowing(data.levels);
		filtered.firstLevelLength = data.levels[0].fromUsers.length;
		filtered.secondLevelLength = data.levels[1].fromUsers.length;

		filtered.companys[0] = User.m.filterByCompany(data.levels[0].fromUsers);
		filtered.companys[1] = User.m.filterByCompany(data.levels[1].fromUsers);

		filtered.repos[0] = User.m.filterByPublicRepos(data.levels[0].fromUsers);
		filtered.repos[1] = User.m.filterByPublicRepos(data.levels[1].fromUsers);

		filtered.gists[0] = User.m.filterByPublicGists(data.levels[0].fromUsers);
		filtered.gists[1] = User.m.filterByPublicGists(data.levels[1].fromUsers);

		filtered.created[0] = User.m.filterByCreated(data.levels[0].fromUsers);
		filtered.created[1] = User.m.filterByCreated(data.levels[1].fromUsers);


		//filtered.cities[0] = User.schema.methods.filterByLocation(data.levels[0].fromUsers);
		//filtered.commonBio[0] = User.schema.methods.filterWordsInBio(data.levels[0].fromUsers);
		//filtered.commonBio[1] = User.schema.methods.filterWordsInBio(data.levels[1].fromUsers);

		console.log('TIME TO FILTER: ', new Date().getTime() - time2)
		return filtered;
	},

	getData: function (request, reply) {
		var username = request.params.name;

		User.schema.methods.getData({login: username}, function (userData) {
			reply(userData)
		})
	},

	getFilteredData: function (request, reply) {
		var username = request.params.name;
		var filteredData = {};

		async.waterfall([
			function (cb) {
				userController.getParsedData(username, function (parsedData) {
					cb(null, parsedData);
				});
			},
			function (parsedData, cb) {
				filteredData = userController.filterData(parsedData);
				cb(null);
			}
		], function () {
			reply(filteredData);
		});
	},

	parseData: function (request, reply) {
		reply({})
	},

	parseTemplate: function (request, reply) {
		var template;
		var username = request.params.name;

		template = nunjucks.render('./app/templates/userPage.html', {
			username: username
		});

		reply(template);
	},

	requestHandler: function (request, reply) {
		var jsonPattern = /application\/json/;
		var accept = request.headers.accept;
		var acceptJson = jsonPattern.test(accept);

		if (acceptJson) {
			//userController.getFilteredData(request, reply);
			userController.getData(request, reply);
		} else {
			userController.parseTemplate(request, reply);
		}
	},

	followingHandler: function (request, reply) {
		userController.getFilteredData(request, reply);
	},

	chordHandler: function (request, reply) {
		var username  = request.params.username;
		var chordData = {};

		userController.getParsedData(username, function (data) {
			chordData = ChordGraph.parseData(username, data.levels);
			reply(chordData);
		});
	}
}

module.exports = userController;