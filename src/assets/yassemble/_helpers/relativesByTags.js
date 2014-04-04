module.exports.register = function (Handlebars, options) {

	var _ = require('lodash');

	Handlebars.registerHelper('relativesByTags', function (pageid, tags, allpages, count, options) {

		var filtredPages = _.filter(allpages, function (page) {
			return (typeof page.tags !== 'undefined' && _.intersection(tags, page.tags).length !== 0 && page.id != pageid);
		});

		var sorted = _.sortBy(filtredPages, function(page) {
			return page.date;
		});

		sorted.reverse();

		var newCollection = [];
		for (var i = 0; i < sorted.length && i < count; i++) {
			newCollection.push(sorted[i]);
		}

		return options.fn({pages:newCollection});
	});
};