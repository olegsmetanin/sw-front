// node_modules
//var assemble = require('./yassemble');
var through = require('through2');
var gutil = require('gulp-util');
var fileutils = require('fs-utils');
var async = require('async');
var _ = require('lodash');
var path = require('path');
var yassemble = require('./yassemble.js');

var PluginError = gutil.PluginError;
var File = gutil.File;

module.exports = function (opts) {

	var options = _.extend({}, opts, {
	});

	options.files = [];

	var bufferFiles = function (page, enc, cb) {

		if (page.isNull()) return;
		if (page.isStream()) return this.emit('error', new PluginError('gulp-yassemble', 'Streaming not supported'));

		var fileDef = {
			base: page.base,
			name: path.relative(page.base,page.path)
		}

		options.files.push(fileDef);

		cb();
	};

	var endStream = function (cb) {

		var self = this;

		//if (options.prepareIndex === true) yassemble.prepareIndex(options);



//		async.each(options.files,
//			function (filesDef, nextComponent) {

				var resultPages = yassemble.generatePages(options.files, options);

				//console.log("resultPages=",resultPages);

				resultPages.forEach(function (page) {
					self.push(new File({
						path: page.dst,
						contents: new Buffer(page.content)
					}));
				})

				cb();

//				var dst0 = path.relative(page.base,page.path);
//				var dst = dst0.substr(0, dst0.lastIndexOf('.'))+'.html'

				//console.log("resultPages=",resultPages);

//				resultPages.forEach(function (page) {
//					self.push(new File({
//						path: file.dst,
//						contents: new Buffer("qwe")
//					}));
//				})

//					self.push(new File({
//						path: "",
//						contents: new Buffer("qwe")
//					}));
//
//				nextComponent();
//			},
//			cb);

	};

	return through.obj(bufferFiles, endStream);

};