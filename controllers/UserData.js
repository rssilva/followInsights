'use strict'

var async = require('async');
var nunjucks = require('nunjucks');
var _ = require('lodash');
var fs = require('fs');

var User = new require('../models/User')();
var Follower = new require('../models/Follower')();
var ChordGraph = require('../models/ChordGraph');

var userController = {
	getData: function (username, callback) {
		User.schema.methods.GET({login: username}, callback);
	},

	getFollowing: function (query, cb) {
		if (_.isArray(query)) {
			Follower.schema.methods.GOT(query, cb);
		}

		if (_.isString(query)) {
			Follower.schema.methods.GOT({login: query}, cb);
		}
	},

	parseTemplate: function (results, chordData) {
		var template;

		template = nunjucks.render('./app/templates/chordTestUsers.html', {
			results: results,
			chordData: JSON.stringify(chordData)
		});

		return template;
	},

	userPageHandler: function (request, reply) {
		var username = request.params.name;
		var results = {};
		var template = '';

		try{
			var fromFile = fs.readFileSync(__dirname + '/' + username + '.json', {enconding: 'utf-8'}); 
			var results = JSON.parse(fromFile.toString());
			var chordData = ChordGraph.parseData(username, results.following, results.secondLevel);
			template = userController.parseTemplate(results, chordData);
			reply(template)
		} catch (e) {
			console.log(e)
			async.waterfall([
				function (cb) {
					//get all users followed by the username
					userController.getFollowing(username, function (following) {
						//get only the 'follows' property from 'following' array
						var firstLevel = _.pluck(following, 'follows');

						results.following = following;

						cb(null, firstLevel);
					});
				},
				function (firstLevel, cb) {
					User.schema.methods.getArray(firstLevel, function (followingObj) {
						results.followingObj = followingObj;
						cb(null, firstLevel);
					});
				},
				function (firstLevel, cb) {
					// get all the users followed by each username in the 'firstLevel' array
					//this method will get the 'followedSecondLevel' from database
					userController.getFollowing(firstLevel, function (data) {
						cb(null, data);
					});
				},
				function (data, cb) {
					results.secondLevel = data;

					var chordData = ChordGraph.parseData(username, results.following, results.secondLevel);
					template = userController.parseTemplate(results, chordData);

					reply(results)
					//reply(chordData);

					fs.writeFile(__dirname + '/' + username + '.json', JSON.stringify(results), function(err) {
						err ? console.log(err)
						:
					    console.log("The file was saved!")
					}); 

					cb(null)
				}
			], function () {
				console.log('this is the end');
			});
		}

	}
}

module.exports = userController;