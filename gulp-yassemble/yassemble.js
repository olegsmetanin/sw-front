'use strict';

var async = require('async');

// Node.js
var path = require('path');
var fs = require('fs');
var util = require('util');

var glob = require("glob")

// node_modules
var yfm = require('assemble-yaml');
var _ = require('lodash');

var handlebars = require('handlebars');
var handlebars_helpers = null;

try {
	handlebars_helpers = require('handlebars-helpers');
} catch (ex) {
	console.log('WARNING: ', ex);
	console.log('To use handlebars-helpers run `npm install handlebars-helpers`');
}

// Register handlebars helpers from handlebars-helpers
if (handlebars_helpers && handlebars_helpers.register) {
	console.log('handlebars_helpers.register');
	handlebars_helpers.register(handlebars, {});
}

var Yassemble = module.exports = {};


Yassemble.generatePages = function (filesDef, opt) {

function fileList(path0) {

	var path = process.cwd()+'/'+path0,
		filenames =  fs.readdirSync(path),
		fullnames = filenames.map(function (str) {
			return path+str;
		});

	return fullnames;

}

var yassemble = {

	producers: {},

	context: {},

	data: {},

	registerProducer: function (name, fn) {
		this.producers[name] = fn
	},

	registerProducers: function (pattern) {
		var self = this;
		var producers = fileList(pattern);
		producers.forEach(function (file) {
			var producer = null;
			try {
				producer = require(file);

				if (typeof producer !== 'undefined') {
					if (typeof producer.register !== 'undefined') {
						producer.register(self);
					} else {
						//grunt.log.writeln('Cannot register producer: ' + file);
					}
				}
			} catch (ex) {
				//grunt.log.writeln('Error loading helpers from file: ' + file);
				//grunt.log.writeln(ex);
			}
		});
	},

	registerHelpers: function (pattern) {
		var helpers = fileList(pattern);
		helpers.forEach(function (file) {
			var helper = null;
			try {
				helper = require(file);

				if (typeof helper !== 'undefined') {
					if (typeof helper.register !== 'undefined') {
						helper.register(handlebars);
					} else {
						//grunt.log.writeln('Cannot register helper: ' + file);
					}
				}
			} catch (ex) {
				//grunt.log.writeln('Error loading helpers from file: ' + file);
				//grunt.log.writeln(ex);
			}
		});
	},

	registerPartials: function (pattern) {
		var partials = fileList(pattern);
		partials.forEach(function (file) {
			var partial = null;
			try {
				//console.log('partial path: ',file);
				var partial = fs.readFileSync(file,'utf8');

				var filename = file.split('\\').pop().split('/').pop();
				var partialName = filename.substr(0, filename.lastIndexOf('.'));

				handlebars.registerPartial(partialName, partial);

			} catch (ex) {
				//grunt.log.writeln('Error loading helpers from file: ' + file);
				//grunt.log.writeln(ex);
			}
		});
	},

	loadData: function (pattern) {
		var self = this;
		var data_in = fileList(pattern);
		data_in.forEach(function (file) {
			try {
				//console.log('partial path: ',file);
				var d_in = require(file);
				_.extend(self.data,d_in);
			} catch (ex) {
				//grunt.log.writeln('Error loading helpers from file: ' + file);
				//grunt.log.writeln(ex);
			}
		});
	},

	utils: {
		groupCollectionByTerm: groupCollectionByTerm,
		filterByCategories: filterByCategories
	}
}



function generatePages(filesDef, opt) {



	var options = opt;

	var self = this;

	// Register handlebars helpers
	yassemble.registerHelpers(options.helpers);

	// Register producers
	yassemble.registerProducers(options.producers);

	// Register partials
	yassemble.registerPartials(options.partials);

	yassemble.loadData(options.data);

	var pages = [];

	filesDef.forEach(function (fileDef) {

		var res = yfm.extract(fileDef.base+fileDef.name);

		var context0 = res.context;

		var content = res.content;

		var tasks = opt.tasks;

		var bp = path.relative(path.dirname(fileDef.name),'.');

		var ext = {
			basepath: bp == '' ? '.' : bp //+path.sep
		};

		var context = _.extend({}, yassemble.data[context0.lang], context0, ext);

		tasks.forEach(function (task) {
			if (_.intersection(task.categories, context.categories).length !== 0) {
				//console.log((process.cwd() || '')+'/'+ options.layouts+ task.layout);
				var layouttpl = fs.readFileSync((process.cwd() || '')+'/'+ options.layouts+ task.layout,'utf8')
				var pagelayout = layouttpl.replace('{{> body }}', content);
				var layout = handlebars.compile(pagelayout);
				var pagehtml = layout(context);
				var newPath = fileDef.name.substr(0, fileDef.name.lastIndexOf('.'))+'.html'
				pages.push({dst:newPath, content:pagehtml})
			}
		})

	})

	return pages;
}




// Utils

function filterByCategories(array, categories) {

	if (typeof categories === 'undefined' || !_.isArray(categories)) {
		return []
	} else {
		return _.filter(array, function (item) {
			if ((typeof item.categories === 'undefined')) {
				return false;
			} else {
				return (_.intersection(item.categories, categories).length !== 0)
			}
		})
	}
}


function groupCollectionByTerm(arr, prop, term, val) {
	return groupCollection(arr, prop, function (hashed) {
		var ret = {};
		ret[term] = hashed.term;
		ret[val] = hashed.data;
		return ret;
	});
}

function groupCollection(arr, prop, cb) {
	var allterms = {};
	for (var i = 0; i < arr.length; i++) {
		var data = arr[i];
		if (typeof data[prop] !== 'undefined') {


			for (var j = 0; j < data[prop].length; j++) {
				var term = data[prop][j];
				if (typeof allterms[term] === 'undefined') {
					allterms[term] = {
						term: term,
						data: [data]
					}
				} else {
					allterms[term].data.push(data);
				}
			}
		}
	}

//      Funcway
//			var plainterms = _.map(arr,function (data) {
//				return _.map(data[prop], function (term) {
//					return {
//						term: term,
//						data: data
//					};
//				});
//			}).flatten();
//
//			var allterms = _.transform(_.groupBy(plainterms, "term"), function (result, val, key) {
//				result[key] = {
//					term: key,
//					data: val
//				}
//			})

	return _.map(allterms, cb);
}

/**
 * Merge two arrays by object property.
 *
 * @param {Array} array1 First array.
 * @param {Array} array1 Second array.
 * @param {string} prop Property name of Array item.
 * @returns {Array} Returns merged array.
 * @example
 *
 * mergeByProperty([
 *   {"prop": "val1", "otherprop":["qwe", "rty"]},
 *   {"prop": "val2", "otherprop":["asd", "fgh"]},
 * ],[
 *   {"prop": "val3", "otherprop":["tyu", "iop"]},
 *   {"prop": "val1", "otherprop":["zxc", "vbn"]}
 * ],'prop')
 * //=>
 * // [
 * //  {"prop": "val1", "otherprop":["qwe", "rty", "zxc", "vbn"]},
 * //  {"prop": "val2", "otherprop":["asd", "fgh"]},
 * //  {"prop": "val3", "otherprop":["tyu", "iop"]}
 * // ]
 *
 */
function mergeByProperty(array1, array2, prop) {


	var index = {};
	var resarr = _.clone(array1);

	for (var i = 0; i < resarr.length; i++) {
		index[resarr[i][prop]] = i;
	}

	for (var i = 0; i < array2.length; i++) {
		var propval = array2[i][prop];
		if (typeof index[propval] === 'undefined') {
			resarr.push(array2[i]);
			index[propval] = resarr.indexOf(propval);
		} else {
			resarr[index[propval]] = _.merge(resarr[index[propval]], array2[i]);
		}

	}

	return resarr;
}

	return generatePages(filesDef, opt);

}
