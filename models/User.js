var model = require('./Model');
var mongoose = require('mongoose');
var _ =  require('lodash');

// @ToDO: avoid 0 results

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

/**
* Get the data from database
* @param {Object} to be used to execute the query
* @param {Function} callback to be called on process end
*/
UserSchema.methods.getData = function (queryObj, cb) {
	var stream;
	var data = {};

	stream = Model.find(queryObj).stream();

	stream.on('data', function (modelData) {
		if (modelData) {
			// this.pause()
			data = modelData;
		}
	});

	stream.on('error', function (err) {
	  	// handle err
	  	console.log(err)
	});

	stream.on('close', function () {
	  	// all done
	  	// console.log('stream CLOSED \n\n\n');
	  	cb(data);
	});
}

/**
* Get the data from database according with the passed array
* @param {Array} containing all the logins to get
* @param {Function} callback to be called on process end
*/
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
		if (modelData) {
			// this.pause()
			data.push(modelData);
		}
	});

	stream.on('error', function (err) {
	  	// handle err
	  	console.log(err)
	})

	stream.on('close', function () {
	  	// all done
	  	cb(data);
	})
}

// @ToDO: check if still necessary after db index optimization
/**
* Iterates through the array checking if there are some item duplicated
* @param {Array} containing all the users to be filtered
* Returns {Array} excluding all the duplicated
*/
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

/**
* Filter decrescent by 'followers' limiting to 10 or less
* @param {Array} containing all the users to be filtered
* Returns {Array}
*/
UserSchema.methods.filterByMostFollowers = function (users) {
	var notDuplicated = this.avoidDuplicated(users);

	return this.sortDecrescent(notDuplicated, 'followers');
}

/**
* Filter decrescent by 'following' limiting to 10 or less
* @param {Array} containing all the users to be filtered
* Returns {Array} filtered
*/
UserSchema.methods.filterByMostFollowing = function (users) {
	var notDuplicated = this.avoidDuplicated(users);

	return this.sortDecrescent(notDuplicated, 'following');
}

/**
* Sort an array decrescent according with the passed prop
* @param {Array} containing all the objects to be sorted
* @param {String} with prop to guide the sort process
* Returns {Array} sorted
*/
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

/**
* Sort an array crescent according with the passed prop
* @param {Array} containing all the objects to be sorted
* @param {String} with prop to guide the sort process
* Returns {Array} sorted
*/
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

/**
* Get the most followed users on second level by users on first
level. This is important because show users that can be relevant
according the people that a user follows
* @param {Array} containing first and second levels
* Returns {Array} sorted
*/
UserSchema.methods.getFollowedByUserFollowing = function (levels) {
	var that = this;
	var users = levels[1].fromFollowers;
	var byUser = [];
	var occur, follows, userInfo, sorted;

	// iterates all users following relation on first level
	users.forEach(function (user) {
		
		// checks if the relation was already mapped on 'byUser' array
		// This is because it's possible to have many 
		// occurrences from the same user on second level
		occur = _.where(byUser, {login: user.follows});

		// if there's no occurrence on 'byUser' array
		if (occur.length === 0) {
			// all the users that follows that specific user
			follows = _.where(users, {follows: user.follows});

			// get the user info
			// @ToDO maybe this is a perfomance issue
			userInfo = that.findUserOnLevels(levels, user.follows);

			// Adding all the users on first level that follows
			// that user on second
			byUser.push({
				login: user.follows,
				followers: _.pluck(follows, 'login'),
				followersLength: follows.length,
				avatar_url: userInfo.avatar_url
			});
		}
	});

	// sorts decrescent according with the quantity of followers
	sorted = this.sortDecrescent(byUser, 'followersLength');

	return sorted;
}

/**
* Get the most followed users on second level by users on first
* @param {Array} containing the first and second levels information
* @param {String} username to search
* Returns {Object} user information
*/
UserSchema.methods.findUserOnLevels = function (levels, username) {
	var user = this.findUserOnArray(levels[0].fromUsers, username);

	if (!user) {
		user = this.findUserOnArray(levels[1].fromUsers, username);
	}

	user = user || {};

	return user;
}

/**
* Iterates through the array to find a
item with an specific username
* @param {Array} containing a level information
* @param {String} username to search
* Returns {Object} user information
*/
UserSchema.methods.findUserOnArray = function (users, username) {
	var user = _.find(users, function (currentUser) {
		if (currentUser.login === username) {
			return currentUser;
		}
	});

	return user;
}

/**
* Groups users by company
* @param {Array} containing a level information
* Returns {Array} users grouped by company
*/
UserSchema.methods.filterByCompany = function (users) {
	var byCompany = _.countBy(users, 'company');
	var filtered = [];

	// this approach to avoid lower case didn't worked because the _.where isn't correct too
	// need to check a better way

	// var byCompany = _.countBy(users, function (user) {
	// 	return String(user.company).toLowerCase();
	// });

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

// @ToDo try a little bit more this method
/**
* Groups user by city
* @param {Array} containing a level information
*/
UserSchema.methods.filterByLocation = function (users) {
	var byLocation = _.countBy(users, 'location');
	var filtered = [];
	console.log(byLocation)

	//filtered = this.sortDecrescent(filtered, 'usersLength');

	return filtered;
}

/**
* Find more common words on users bio
* @param {Array} containing a level information
*/
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