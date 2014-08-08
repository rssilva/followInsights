var userRouter = require('./UserRouter');
var nunjucks = require('nunjucks');

var Router = {
	init: function (server, rootPath) {
		this.server = server;
		this.rootPath = rootPath;
	},

	set: function () {
		userRouter.init(this.server);
		userRouter.set();

		this.setIndexPage();
		this.setStatic();
	},

	setIndexPage: function () {
		var indexHandler = function (request, reply) {
	        var template = nunjucks.render('./app/templates/test.html', { 
	            title: 'James', 
	            content: 'Laudrup' 
	        });

	        reply(template);
	    }

		this.server.route({
		    method: 'GET',
		    path: '/',
		    handler: indexHandler
		});
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