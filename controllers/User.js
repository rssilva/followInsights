var usersCollection = require('../collections/User');
var model = require('../models/User');

var userController = {
	getData: function (username, callback) {
		var url = 'https://api.github.com/users/' + username;
		
		model.get(url, callback);
	},
	getFollowers: function (username, cb) {
		var url = 'https://api.github.com/users/' + username + '/followers';
		
		usersCollection.getModels(url, cb);
	},

	getFollowing: function (username, cb) {
		var url = 'https://api.github.com/users/' + username + '/following';
		
		usersCollection.getModels(url, cb);
	}
}

module.exports = userController;