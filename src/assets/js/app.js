'use strict';
/*jslint browser: true, unused: false */

(function () {

	var $ = require('jquery'),
		skrollrlib = require('skrollr'),
		skrollrmenulib = require('skrollrmenu'),
		bootstrap = require('bootstrap');

	var init = function () {
		//		console.log('begin');

		var skrollr = skrollrlib.init({forceHeight: false});
		skrollrlib.menu.init(skrollr);

		$(window).on("resizeBegin", function () {
		});

		$(window).resize(function () {
			var self = this;
			if (!self.resizing) {
				self.resizing = true;
				$(this).trigger('resizeBegin');
			}
			if (this.resizeTO) clearTimeout(this.resizeTO);
			this.resizeTO = setTimeout(function () {
				self.resizing = false;
				$(this).trigger('resizeEnd');
			}, 500);
		});

		var resize = function () {
			var ratio = 9 / 16;
			var width = $(window).width();
			var heigth = $(window).height();

			$(".ani-pic").each(function (i, elm) {
				var el = $(elm);
				var elwidth = (width * ratio > heigth) ? width : heigth / ratio;
				var elheigth = (width * ratio > heigth) ? width * ratio : heigth;
				el.width(elwidth);
				el.height(elheigth);
				var id = el.attr('id');
				var focus = el.attr('data-focus');
				if (focus) {
					var mr = (width * ratio > heigth) ? 0 : -1 * (elwidth * focus - width / 2);
					if (elwidth + mr < width) mr = width - elwidth;
					if (mr > 0) mr = 0;
					el.css('margin-left', mr + 'px');
				}
			});

			$(".ani-bg").each(function (i, elm) {
				var el = $(elm);
				el.width(width);
				el.height(heigth);
			});

			$(".ani-scr").each(function (i, elm) {
				var el = $(elm);
				var elwidth = el.width();
				var elheigth = el.height();
				var parent = el.parent();
				var parwidth = parent.width();

				var focus_x = el.attr('data-focus-x');
				var focus_y = el.attr('data-focus-y');
				var dx = (parwidth / 2 - elwidth * focus_x);
				var dy = 0;
				dx = dx < (parwidth - elwidth) ? (parwidth - elwidth) : dx;
				dx = dx > 0 ? 0 : dx;
				if (focus_y) dy = elheigth * focus_y;

//				center to focus
//				console.log(i);
				el.css('margin-left', dx + 'px');

//				animation to focus
//				el.attr('data-center-top','margin-left:0px');
//				el.attr('data-center-bottom','margin-left:'+(parwidth-elwidth)+'px');
//				el.attr('data-'+dy+'-center','margin-left:'+dx+'px');
			});

			$('.container-full').show();

		};

		$(window).on("resizeEnd", function () {
//			console.log('resizeEnd');
			resize();
		});

		resize();
	};

	function isPhonegap() {
		return typeof cordova !== 'undefined' || typeof PhoneGap !== 'undefined' || typeof phonegap !== 'undefined';
	}

	if (isPhonegap()) {
		document.addEventListener('deviceready', init, false);
	} else {
		$(function () {
			init();
		});
	}


})();