var _ = require('lodash');
var User = new require('../models/User')();

var chordGraph = {
	nodes: [],
	insertQueryUser: function (username, firstLevel) {
		this.nodes.push({
			name: username,
			imports: _.pluck(firstLevel, 'follows')
		})
	},

	parseData: function (username, levels) {
		var that = this;
		var toInsert = [];
		var byUser = [];
		var loginsByUser = [];
		var firstLevel = levels[0].fromFollowers;
		var secondLevel = levels[1].fromFollowers;

		this.nodes = [];
		this.insertQueryUser(username, firstLevel);

		console.log('lenghts', firstLevel.length, secondLevel.length)

		//iterates through the first level users
		_.each(firstLevel, function (followedFirstLevel) {
			// return an array with objects representing the followed users on the 
			//secondLevel aggregated by the users on the first level
			//It's necessary because the results.secondLevel is an array with objects
			//but is not filtered
			byUser = _.where(secondLevel, {login: followedFirstLevel.follows})
			//console.log(followedFirstLevel.follows)
			//get just the property 'follows' on 'byUser' array
			loginsByUser = _.pluck(byUser, 'follows');

			//avoids duplicated entrys from database (yes, I know, that sucks)
			loginsByUser = _.union(loginsByUser);

			that.nodes.push({
				name: followedFirstLevel.follows,
				imports: loginsByUser
			});
		});

		toInsert = this.findMissingNodes();
		this.insertMissingNodes(toInsert);

		console.log('nodes length ' , this.nodes.length)

		var user = {};

		_.each(this.nodes, function (node) {
			
			if (node.name !== username) {
				user = User.schema.methods.findUserOnLevels(levels, node.name);
				//console.log(user.login)
			}
		})

		return this.nodes;
	},

	findMissingNodes: function () {
		var that = this;
		var toInsert = [];
		var contains = false;
		var present = false;

		//find users on missing nodes that aren't listed
		_.each(this.nodes, function (user) {
			_.each(user.imports, function (imported) {
				present = _.where(that.nodes, {name: imported});
				contains = _.contains(toInsert, imported);

				if (present.length === 0 && !contains) {
					toInsert.push(imported)
				}
			});
		});

		return toInsert;
	},

	insertMissingNodes: function (toInsert) {
		var that = this;

		//insert missing nodes on first level of the tree
		_.each(toInsert, function (missedOnMap) {
			that.nodes.push({
				name: missedOnMap,
				imports: []
			});
		});
	}
}

module.exports = chordGraph;