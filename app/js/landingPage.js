(function () {
	var input = $('.username');

	var bindEvents = function () {
		input.on('keypress', function(event) {
			if (event.keyCode == 13) {
				event.preventDefault();
				redirect();
			}
		});

		$('.user-form').submit(function () {
			redirect();
		});

		$('.go-button').on('click', function (e) {
			e.preventDefault();
			redirect();
		});
	}

	var redirect = function () {
		window.location = '/users/' + input.val();
	}

	bindEvents();
})();