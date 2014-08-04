var Hapi = require('hapi');
var server;
var router = require('./routes/Routes');
var nunjucks = require('nunjucks');

server = new Hapi.Server(3000, {
    files: {relativeTo: __dirname + 'app'}
});

server.start(function () {
    console.log('Server running at:', server.info.uri);
});

router.init(server, __dirname);
router.set();

server.route({
    method: 'GET',
    path: '/',
    handler: function (request, reply) {

    	var res = nunjucks.render('./app/templates/test.html', { 
    		title: 'James', 
    		content: 'Laudrup' 
    	});

    	reply(res);
    }
});

