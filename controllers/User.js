'use strict'

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

	parseTemplate: function (username, results, data) {
		var template, chordData;

		results.secondLevel = data;

		chordData = ChordGraph.parseData(username, results.following, results.secondLevel);

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

		async.waterfall([
			function (cb) {
				//get all users followed by the username
				userController.getFollowing(username, function (following) {
					//get only the 'follows' property from 'following' array
					var followedFirstLevel = _.pluck(following, 'follows');

					results.following = following;

					cb(null, followedFirstLevel);
				});
			},
			function (followedFirstLevel, cb) {
				// get all the users followed by each username in the 'followedFirstLevel' array
				//this method will get the 'followedSecondLevel' from database
				userController.getFollowing(followedFirstLevel, function (data) {
					cb(null, data);
				});
			},
			function (data, cb) {
				template = userController.parseTemplate(username, results, data);
				reply(template);
				cb(null)
			}
		], function () {
			console.log('this is the end');
		});
	}
}

module.exports = userController;