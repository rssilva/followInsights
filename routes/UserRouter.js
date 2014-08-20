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
	server.route({
	    method: 'GET',
	    path: '/users/{name}',
	    handler: userController.requestHandler
	});

	server.route({
	    method: 'GET',
	    path: '/users/{username}/chordGraph',
	    handler: userController.chordHandler
	});
}


module.exports = UserRouter;