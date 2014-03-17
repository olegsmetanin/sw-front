'use strict';

var gulp = require('gulp'),
	browserify = require('gulp-browserify'),
	bower = require('gulp-bower'),
	//concat = require('gulp-concat'),
	refresh = require('gulp-livereload'),
	gulpsass = require('gulp-sass'),
	bourbon = require('node-bourbon').includePaths,
	lrserver = require('tiny-lr')(),
	express = require('express'),
	livereload = require('connect-livereload'),
    path = require('path'),
	plato = require('gulp-plato'),
	jshint = require('gulp-jshint'),
	log = require('gulp-util').log,
	beautify = require('gulp-beautify'),
	iconfont = require('gulp-iconfont');

var livereloadport = 35729,
	serverport = 5001;

var server = express();

server.use(livereload({
	port: livereloadport
}));

server.use(express.static(path.resolve('./dist')));

gulp.task('bower', function() {
	bower()
});

gulp.task('scripts', function() {
	return gulp.src(['./src/assets/js/app.js'])
		.pipe(browserify({
			debug:true,
			shim: {
				'skrollr': {
					path: 'src/assets/vendor/skrollr/dist/skrollr.min.js',
					exports: 'skrollr'
				},
				'bootstrap': {
					path: 'src/assets/vendor/bootstrap-sass/dist/js/bootstrap.js',
					exports: null,
					depends: {
						jquery: 'jQuery'
					}
				},
				'jquery': {
					path: 'src/assets/vendor/jquery/dist/jquery.js',
					exports: 'jQuery'
				}
			}
		}))
		.on('prebundle', function(bundle) {
			//bundle.external('jquery');
		})
		.pipe(gulp.dest('./dist/assets/js'))
		.pipe(refresh(lrserver));
});

gulp.task('styles', function () {
	return gulp.src(['./src/assets/scss/main.scss'])
		.pipe(gulpsass({
			outputStyle: 'expanded',
			includePaths: [
				'./src/assets/scss',
				"./src/assets/vendor/bootstrap-sass/lib"
			].concat(bourbon),
			errLogToConsole: true
		}))
		.pipe(gulp.dest('./dist/assets/css'));
});


gulp.task('font', function() {
	return gulp.src(["src/assets/vendor/bootstrap-sass/fonts/**"])
		.pipe(gulp.dest('./dist/assets/fonts'));
});

gulp.task('iconfont', function(){
	gulp.src(['./src/assets/icons/*.svg'])
		.pipe(iconfont({
			fontName: 'appfont'
		}))
		.pipe(gulp.dest('./dist/assets/fonts'));
});


gulp.task('html', function() {
	return gulp.src(["src/**/*.html", "!src/assets/**"])
		.pipe(gulp.dest('./dist'));
});

gulp.task('serve', function() {
	server.listen(serverport);
	lrserver.listen(livereloadport);
});

gulp.task('watch', function () {
	gulp.watch('src/assets/js/**', ['lint','scripts']);
	gulp.watch('src/assets/scss/**', ['styles']);
	gulp.watch(['src/**/*.html', '!src/assets/**'], ['html']);
});

gulp.task('lint', function() {
	log('Linting Files');
	return gulp.src("./src/assets/js/**/*.js")
		.pipe(jshint('.jshintrc'))
		.pipe(jshint.reporter());
});

gulp.task('report', function () {
	gulp.src('./src/assets/js/**/*.js')
		.pipe(plato('report', {
			jshint: {
				options: {
					strict: true
				}
			},
			complexity: {
				trycatch: true
			}
		}));
});

gulp.task('beautify', function() {
	gulp.src('./src/assets/js/**/*.js')
		.pipe(beautify({indentSize: 2}))
		.pipe(gulp.dest('./src/js/'))
});

gulp.task('default', ['bower','lint','scripts', 'styles', 'font', 'html', 'serve', 'watch']);
