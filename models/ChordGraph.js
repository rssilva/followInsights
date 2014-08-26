var _ = require('lodash');

var chordGraph = {
	nodes: [],

	/**
	* Insert the user on the nodes structure
	* @param {String} username on initial query
	* @param {Array} contains user data from first level
	*/
	insertQueryUser: function (username, firstLevel) {
		this.nodes.push({
			name: username,
			imports: _.pluck(firstLevel, 'follows')
		})
	},

	/**
	* Parses data that will generate the chord graph
	* @param {String} username on initial query
	* @param {Array} contains user data from first and second level
	* Returns the parsed array on d3.js chord graph format
	*/
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

		// iterates through the first level users
		_.each(firstLevel, function (followedFirstLevel) {
			// return an array with objects representing the followed users on the 
			// secondLevel aggregated by the users on the first level
			// It's necessary because the results.secondLevel is an array with objects
			// but is not filtered
			byUser = _.where(secondLevel, {login: followedFirstLevel.follows})
			
			// get just the property 'follows' on 'byUser' array
			loginsByUser = _.pluck(byUser, 'follows');

			// avoids duplicated entrys from database (yes, I know, that sucks)
			// maybe it's not more necessary because the login was added as index
			// and duplicated was dropped
			// loginsByUser = _.union(loginsByUser);

			// inserting the current user from first level and all 
			// the users that he follows
			that.nodes.push({
				name: followedFirstLevel.follows,
				imports: loginsByUser
			});
		});

		toInsert = this.findMissingNodes();
		this.insertMissingNodes(toInsert);

		console.log('nodes length ' , this.nodes.length)

		return this.nodes;
	},

	/**
	* Find all users that are present on 'imports' array but 
	isn't an object on structure yet. This structure is required by d3.js graph
	* Returns a list with the logins that is missing
	*/
	findMissingNodes: function () {
		var that = this;
		var toInsert = [];
		var contains = false;
		var present = false;

		// iterates through all 'imports' array on nodes
		// looking for users that is present on any 'imports' array
		// but is not a node on the structure yet
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

	/**
	* Inserts missing nodes on the structure
	* @param {Array} contains all logins that should be inserted as nodes
	*/
	insertMissingNodes: function (toInsert) {
		var that = this;

		// iterates through all the missing nodes
		// adding it with a 'name' prop and an empty array
		// because this users didn't follow anyone present
		// on first and zero levels
		_.each(toInsert, function (missedOnMap) {
			that.nodes.push({
				name: missedOnMap,
				imports: []
			});
		});
	}
}

module.exports = chordGraph;