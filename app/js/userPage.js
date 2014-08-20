(function () {
	var Page = {
		init: function () {

		},

		getUserData: function () {
			var that = this;

			$.ajax({
				dataType: 'json',
				url: '/users/' + exports.username
			}).done(function(data) {
				that.onData(data)
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

		onData: function (data) {
			console.log(data)
			//this.getChordData();

			this.renderUser(data.userData);
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
	
	//console.log('wait a minute...')
	Page.init();
	Page.getUserData();

})();