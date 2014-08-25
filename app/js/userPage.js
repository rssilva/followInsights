(function () {
	var Page = {
		init: function () {
			this.messageModule = exports.MessageModule;
			this.messageModule.init($('.loading-warn'));
		},

		start: function () {
			this.messageModule.show('Fetching user data...');
			this.getUserData();
		},

		getUserData: function () {
			var that = this;

			$.ajax({
				dataType: 'json',
				url: '/users/' + exports.username
			}).done(function(data) {
				that.onUserData(data)
			});
		},

		getFollowingData: function () {
			var that = this;

			$.ajax({
				dataType: 'json',
				url: '/users/' + exports.username + '/following'
			}).done(function(data) {
				that.onFollowingData(data)
			});
		},

		getChordData: function () {
			var that = this;

			$.ajax({
				dataType: 'json',
				url: '/users/' + exports.username + '/chordGraph'
			}).done(function(chordData) {
				that.onChordData(chordData)
			});
		},

		onUserData: function (data) {
			if (data && data.login) {
				this.renderUser(data);

				this.messageModule.show('Just a minute, there\'s a lot of data on back-end :)');

				this.getFollowingData();
			} else {
				//user not founded
			}
		},

		onFollowingData: function (data) {
			console.log(data)
			//this.getChordData();
			this.messageModule.hide();
			this.renderFollows(data);
			this.renderCompanys(data.companys);
		},

		onChordData: function (chordData) {
			exports.chordData = chordData;
			PLOTCHORD();
		},

		renderUser: function (userData) {
			var $el = $('.user-data');
			var template = $('#userTemplate').html();

			var compiled = _.template(template, {user: userData});
			
			$el.html(compiled);
		},

		renderFollows: function (data) {
			var $el = $('.follow-data');
			var template = $('#followsTemplate').html();

			var compiled = _.template(template, {data: data});
			
			$el.html(compiled);
		},

		renderCompanys: function (companys) {
			var $el = $('.company-data');
			var template = $('#companysTemplate').html();

			var compiled = _.template(template, {companys: companys});
			$el.html(compiled)
		},
	}
	
	Page.init();
	Page.start();
})();