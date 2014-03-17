'use strict';

(function () {

	var $ = require('jquery');
	var skrollr = require('skrollr');
	var bootstrap = require('bootstrap');

	$(function () {
		$('#qwe').on('click', function () {
			console.log("zxc");
		});

		skrollr.init();


		$(window).scroll(function(){
			if ($(this).scrollTop() > 100) {
				$(".navbar.navbar-fixed-top").addClass("scroll");
			} else {
				$(".navbar.navbar-fixed-top").removeClass("scroll");
			}
		});

	});
})();