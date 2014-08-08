var Collection = require('./Collection');
var model = require('../models/User');

var UserCollection = {
	model: model,
	getModels: Collection.getModels
}

module.exports = UserCollection;