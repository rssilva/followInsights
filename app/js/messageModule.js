var exports = exports || {};

(function () {
	var MessageModule = {
		init: function (el) {
			this.el = el;
		},

		show: function (message) {
			if (message) {
				this.el.find('.message').text(message);
			}

			this.el.removeClass('display-none');
		},

		hide: function () {
			this.el.addClass('display-none');
		}
	};

	exports.MessageModule = MessageModule;
})();