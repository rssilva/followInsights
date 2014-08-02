var userRouter = require('./UserRouter');

var Router = {
	init: function (server, rootPath) {
		this.server = server;
		this.rootPath = rootPath;
	},

	set: function () {
		userRouter.init(this.server);
		userRouter.set();

		this.setStatic();
	},

	setStatic: function () {
		var that = this;

		var staticHandler = {
			file: function (request) {
			    return that.rootPath + request.url.path;
			}
		}

		this.server.route({
		    method: 'GET',
		    path: '/app/{filename*}',
		    handler: staticHandler
		});
	}
}

module.exports = Router;