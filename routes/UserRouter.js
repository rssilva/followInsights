var nunjucks = require('nunjucks');
var userController = require('../controllers/User');
var async = require('async')

var UserRouter = {
	init: function (server) {
		this.server = server;
	},
	set: function () {
		setRoutes(this.server);
	}
}

function setRoutes (server) {
	var userPageHandler = function (request, reply) {
		var username = request.params.name;

		async.waterfall([
			function (cb) {
				userController.getData(username, function (userData) {
					console.log(userData)
				    cb(null, userData);
				});
			},
			function (userData, cb) {
				userController.getFollowing(username, function (users) {

				    var template = nunjucks.render('./app/templates/chord.html', {users: users});
				    reply(template);
				    cb(null);
				});
			}
		], function (cb) {
			console.log('there there ')

		});
	}

	server.route({
	    method: 'GET',
	    path: '/users/{name}',
	    handler: userPageHandler
	});
}


module.exports = UserRouter;