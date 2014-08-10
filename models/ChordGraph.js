var _ = require('lodash');

var chordGraph = {
	nodes: [],
	parseData: function (firstLevel, secondLevel) {
		var that = this;
		var toInsert = [];

		//iterates through the first level users
		_.each(firstLevel, function (followedFirstLevel) {
			// return an array with objects representing the followed users on the 
			//secondLevel aggregated by the users on the first level
			//It's necessary because the results.secondLevel is an array with objects
			//but is not filtered
			var byUser = _.where(secondLevel, {login: followedFirstLevel.follows})

			//get just the property 'follows' on 'byUser' array
			var loginsByUser = _.pluck(byUser, 'follows');

			//avoids duplicated entrys from database (yes, exactly)
			loginsByUser = _.union(loginsByUser);

			that.nodes.push({
				name: followedFirstLevel.follows,
				size: 1000,
				imports: loginsByUser
			});
		});

		toInsert = this.findMissingNodes();
		this.insertMissingNodes(toInsert);

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

		console.log(toInsert)

		return toInsert;
	},

	insertMissingNodes: function (toInsert) {
		var that = this;

		//insert missing nodes on first level of the tree
		_.each(toInsert, function (missedOnMap) {
			that.nodes.push({
				name: missedOnMap,
				size: 1000,
				imports: []
			});
		});
	}
}

module.exports = chordGraph;