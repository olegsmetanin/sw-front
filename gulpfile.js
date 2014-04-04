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
	iconfont = require('gulp-iconfont'),
	yassemble = require('./gulp-yassemble/index.js');

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
				'skrollrmenu': {
					path: 'src/assets/vendor/skrollr-menu/src/skrollr.menu.js',
					exports: null,
					depends: {
						skrollr: 'skrollr'
					}
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
	return gulp.src(['./src/assets/scss/main.scss','./src/assets/scss/appbootstrap.scss', './src/assets/scss/appfontawesome.scss'])
		.pipe(gulpsass({
			outputStyle: 'expanded',
			includePaths: [
				'./src/assets/scss',
				"./src/assets/vendor/bootstrap-sass/lib",
				"./src/assets/vendor/font-awesome/scss"
			].concat(bourbon),
			errLogToConsole: true
		}))
		.pipe(gulp.dest('./dist/assets/css'));
});


gulp.task('font', function() {
	return gulp.src(["src/assets/vendor/bootstrap-sass/fonts/**", "src/assets/vendor/font-awesome/fonts/**"])
		.pipe(gulp.dest('./dist/assets/fonts'));
});

gulp.task('iconfont', function(){
	return gulp.src(['./src/assets/icons/*.svg'])
		.pipe(iconfont({
			fontName: 'appfont',
			appendCodepoints: true, // recommanded option
			descent:  -256,
			fontHeight: 1792,
			fontWidth: 1536
		}))
		.pipe(gulp.dest('./dist/assets/fonts'));
});


gulp.task('html', function() {
	return gulp.src(["src/**/*", "!src/**/*.hbs", "!src/assets/**"])
		.pipe(gulp.dest('./dist'));
});

gulp.task('yassemble', function() {
	return gulp.src(["src/**/*.hbs", "!src/assets/**"])
		.pipe(yassemble({
			helpers: ["src/assets/yassemble/_helpers/"],
			plugins: ['src/assets/yassemble/_plugins/'],
			partials: ['src/assets/yassemble/_partials/'],
			producers: ["src/assets/yassemble/_producers/"],
			layouts: ["src/assets/yassemble/_layouts/"],
			data: ["src/assets/yassemble/_data/"],
			index: ["src/assets/yassemble/_index/"],
			tasks: [{
				categories:['promo', 'single'],
				layout: 'single.hbs',
				producer: 'plain'
			}]
		}))
		.pipe(gulp.dest('./dist'));
});

gulp.task('img', function() {
	return gulp.src(["src/assets/img/**"])
		.pipe(gulp.dest('./dist/assets/img'));
});

gulp.task('serve', function() {
	server.listen(serverport);
	lrserver.listen(livereloadport);
});

gulp.task('watch', function () {
	gulp.watch('src/assets/js/**', ['lint','scripts']);
	gulp.watch('src/assets/scss/**', ['styles']);
	gulp.watch('src/assets/icons/**', ['iconfont']);
	gulp.watch('src/assets/img/**', ['img']);
	gulp.watch(['src/**/*.*',  "!src/**/*.hbs", '!src/assets/**'], ['html']);
	gulp.watch(['src/**/*.hbs', '!src/assets/**'], ['yassemble']);
	gulp.watch(['src/assets/yassemble/**/*.hbs'], ['yassemble']);
});

gulp.task('lint', function() {
	log('Linting Files');
	return gulp.src("./src/assets/js/**/*.js")
		.pipe(jshint('.jshintrc'))
		.pipe(jshint.reporter());
});

gulp.task('report', function () {
	return gulp.src('./src/assets/js/**/*.js')
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
	return gulp.src('./src/assets/js/**/*.js')
		.pipe(beautify({indentSize: 2}))
		.pipe(gulp.dest('./src/js/'))
});

gulp.task('default', ['bower','lint','scripts', 'styles', 'font', 'iconfont', 'img', 'html', 'yassemble', 'serve', 'watch']);
