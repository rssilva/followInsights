var config = require('./config')();
var mongoose = require('mongoose');
var Hapi = require('hapi');
var server;
var router = require('./routes/Routes');
var nunjucks = require('nunjucks');
var PORT = process.argv[3] || 80;
var db;

if (process.argv[2]) {
    config.setEnv(process.argv[2])
}

mongoose.connect('mongodb://' + config.db.host + '/' + config.db.name);

db = mongoose.connection;

db.on('error', function () {
    console.error.bind(console, 'connection error:')
    //@ToDO: communicate database problem
});

db.once('open', function callback () {
    console.log('mongo connected')
    //init()
});

function init () {
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
}