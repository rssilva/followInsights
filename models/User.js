var model = require('./Model');
var mongoose = require('mongoose');
var _ =  require('lodash');

var UserSchema = mongoose.Schema({
	login: String,
	avatar_url: String,
	html_url: String,
	name: String,
	company: String,
	location: String,
	followers: Number,
	following: Number,
	public_repos: Number,
	public_gists: Number,
	created_at: Date
});

var Model = mongoose.model('User', UserSchema, 'users');

UserSchema.methods.getData = function (queryObj, cb) {
	var stream;
	var data = {};

	stream = Model.find(queryObj).stream();

	stream.on('data', function (modelData) {
		if (modelData) {
			//this.pause()
			data = modelData;
		}

	  	//res.write(doc)
	});

	stream.on('error', function (err) {
	  	// handle err
	  	console.log(err)
	})

	stream.on('close', function () {
	  	// all done
	  	//console.log('stream CLOSED \n\n\n');
	  	cb(data);
	})

	// request(opts, function (error, response, body) {
	// 	cb(JSON.parse(body))
	// });
}

UserSchema.methods.getArray = function (queryObj, cb) {
	var data = [];
	var stream = Model.find({
		login: { $in: queryObj}
	}).stream();

	// model.find({
	//     '_id': { $in: [
	//         '4ed3ede8844f0f351100000c',
	//         '4ed3f117a844e0471100000d', 
	//         '4ed3f18132f50c491100000e'
	//     ]}
	// }, function(err, docs){
	//      console.log(docs);
	// });

	stream.on('data', function (modelData) {
		//console.log(doc)
		if (modelData) {
			//this.pause()
			data.push(modelData);
		}
	});

	stream.on('error', function (err) {
	  	// handle err
	  	console.log(err)
	})

	stream.on('close', function () {
	  	// all done
	  	//console.log('stream CLOSED \n\n\n');
	  	cb(data);
	})
}

UserSchema.methods.avoidDuplicated = function (users) {
	var presents = [];
	var occur;

	var filtered = users.filter(function (user) {
		occur = presents.indexOf(user.login);
		presents.push(user.login);

		return occur === -1;
	});

	return filtered;
}

UserSchema.methods.filterByMostFollowers = function (users) {
	var notDuplicated = this.avoidDuplicated(users);

	return this.sortDecrescent(notDuplicated, 'followers');
}

UserSchema.methods.filterByMostFollowing = function (users) {
	var notDuplicated = this.avoidDuplicated(users);

	return this.sortDecrescent(notDuplicated, 'following');
}

UserSchema.methods.sortDecrescent = function (data, prop) {
	var response = [];
	var ordered = _.sortBy(data, prop);
	var limit = 0;
	var i = ordered.length - 1;

	i < 10 ? limit = 0 : limit = i - 10;
	
	for (; i > limit; i--) {
		response.push(ordered[i]);
	}

	return response;
}

UserSchema.methods.sortCrescent = function (data, prop) {
	var response = [];
	var ordered = _.sortBy(data, prop);
	var i = 0;
	var limit = ordered.length;

	i < 10 ? limit = 10 : null;
	
	for (i = 0; i < limit; i++) {
		response.push(ordered[i]);
	}

	return response;
}

//@ToDO: avoid 0 results to MOST
UserSchema.methods.getFollowedByUserFollowing = function (levels) {
	var that = this;
	var users = levels[1].fromFollowers;
	var byUser = [];
	var occur, follows, userInfo, sorted;

	users.forEach(function (user) {
		
		occur = _.where(byUser, {login: user.follows});

		if (occur.length === 0) {
			//all the users that follow that specific person
			follows = _.where(users, {follows: user.follows});

			userInfo = that.findUserOnLevels(levels, user.follows);

			byUser.push({
				login: user.follows,
				followers: _.pluck(follows, 'login'),
				followersLength: follows.length,
				avatar_url: userInfo.avatar_url
			});
		}
	});

	sorted = this.sortDecrescent(byUser, 'followersLength');

	return sorted;
}

UserSchema.methods.findUserOnLevels = function (levels, username) {
	var user = this.findUserOnArray(levels[0].fromUsers, username);

	if (!user) {
		user = this.findUserOnArray(levels[1].fromUsers, username);
	}
	user = user || {};

	return user;
}

UserSchema.methods.findUserOnArray = function (users, username) {
	var user = _.find(users, function (currentUser) {
		if (currentUser.login === username) {
			return currentUser;
		}
	});
	return user;
}

UserSchema.methods.filterByCompany = function (users) {
	var byCompany = _.countBy(users, 'company');
	var filtered = [];

	for (var company in byCompany) {
		if (company != 'null' && company != 'undefined' && company != '' && byCompany[company] > 1) {
			filtered.push({
				name: company,
				usersLength: byCompany[company],
				users: _.pluck(_.where(users, {company: company}), 'login')
			})
		}
	}

	filtered = this.sortDecrescent(filtered, 'usersLength');

	return filtered;
}

UserSchema.methods.filterByLocation = function (users) {
	var byLocation = _.countBy(users, 'location');
	var filtered = [];
	console.log(byLocation)
	// for (var company in byCompany) {
	// 	if (company != 'null' && company != 'undefined' && company != '' && byCompany[company] > 1) {
	// 		filtered.push({
	// 			name: company,
	// 			usersLength: byCompany[company],
	// 			users: _.pluck(_.where(users, {company: company}), 'login')
	// 		})
	// 	}
	// }

	//filtered = this.sortDecrescent(filtered, 'usersLength');

	return filtered;
}

UserSchema.methods.filterWordsInBio = function (users) {
	var bios = _.pluck(users, 'bio');
	var words = {};
	var separated = [];
	var replaced = '';
	//console.log(bios)
	_.each(bios, function (bio) {
		if (bio) {
			//console.log(bio)
			bio = bio.replace(/[,\.\-=]{0,}/g, '');
			replaced = bio.replace(/ (about|as|it|not|my|the|at|a|for|of|in|to|and|de|on|with|is|do|from|using|or|he) /g, '');
			separated = replaced.toLowerCase().split(' ');

			_.each(separated, function (word) {
				words[word] ? words[word]++ : words[word] = 1;
			})
		}
	});

	var toArray = [];

	_.each(words, function (val, word) {
		if (word) {
			toArray.push({
				word: word,
				times: val
			})
		}
	});

	var sorted = _.sortBy(toArray, 'times');
}

UserSchema.methods.filterByPublicRepos = function (users) {
	return this.sortDecrescent(users, 'public_repos');
}

UserSchema.methods.filterByPublicGists = function (users) {
	return this.sortDecrescent(users, 'public_gists');
}

UserSchema.methods.filterByCreated = function (users) {
	return this.sortCrescent(users, 'created_at');
}


module.exports = Model;