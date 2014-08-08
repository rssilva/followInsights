var model = require('./Model');
var mongoose = require('mongoose');

var userSchema = mongoose.Schema({
	login: String,
	avatar_url: String,
	html_url: String,
	name: String,
	company: String,
	blog: String,
	location: String
});

var User = {
	schema: userSchema,
	model: mongoose.model('User', userSchema, 'users'),
	get: model.get
}

module.exports = User