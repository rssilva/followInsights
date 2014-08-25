(function () {
	var goButton = $('.go-button');
	var input = $('.username');

	input.on('keypress', function(event) {
		if (event.keyCode == 13) {
			event.preventDefault();
			redirect();
		}
	});

	$('.user-form').submit(function () {
		redirect();
	});

	goButton.on('click', function (e) {
		e.preventDefault();
		redirect();
	});

	var redirect = function () {
		window.location = '/users/' + input.val();
	}
})();