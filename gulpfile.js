'use strict';

var gulp = require('gulp'),
	browserify = require('gulp-browserify'),
	bower = require('gulp-bower'),
	//concat = require('gulp-concat'),
	refresh = require('gulp-livereload'),
	sass = require('gulp-sass'),
	bourbon = require('node-bourbon').includePaths,
	lrserver = require('tiny-lr')(),
	express = require('express'),
	livereload = require('connect-livereload'),
    path = require('path');

var livereloadport = 35729,
	serverport = 5001;

var server = express();

server.use(livereload({
	port: livereloadport
}));

server.use(express.static(path.resolve('./')));

gulp.task('bower', function() {
	bower()
});

gulp.task('scripts', function() {
	return gulp.src(['./src/js/app.js'])
		.pipe(browserify({
			debug:true,
			shim: {
				jquery: {
					path: 'src/vendor/jquery/dist/jquery.js',
					exports: 'jquery'
				},
				'skrollr': {
					path: 'src/vendor/skrollr/dist/skrollr.min.js',
					exports: 'skrollr'
				},
				'bootstrap': {
					path: 'src/vendor/bootstrap/dist/js/bootstrap.js',
					exports: 'bootstrap',
					depends: {
						jquery: 'jquery'
					}
				}
			}
		}))
		.on('prebundle', function(bundle) {
			//bundle.external('jquery');
		})
		.pipe(gulp.dest('./dist/js'))
		.pipe(refresh(lrserver));
});

gulp.task('styles', function () {
	return gulp.src('./src/scss/main.scss')
		.pipe(sass({
			outputStyle: 'expanded',
			includePaths: ['./src/scss'].concat(bourbon),
			errLogToConsole: gulp.env.watch
		}))
		.pipe(gulp.dest('./dist/css'));
});

gulp.task('serve', function() {
	server.listen(serverport);
	lrserver.listen(livereloadport);
});

gulp.task('watch', function () {
	gulp.watch('src/js/**', ['scripts']);
	gulp.watch('src/scss/**', ['styles']);
});

gulp.task('default', ['bower','scripts', 'styles', 'serve', 'watch']);
